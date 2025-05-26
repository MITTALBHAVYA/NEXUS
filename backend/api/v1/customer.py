from fastapi import APIRouter, status, Depends, Header, Response, Body
from data_response.base_response import APIResponseBase
from schemas.customer import (
    CustomerLoginRequest,
    CustomerLoginResponse,
    CustomerRegisterRequest,
    CustomerRegisterResponse,
    CustomerProfileUpdateRequest,
    GoogleLoginRequest
)
from helper.auth import JWTHandler, RefreshTokenData, AccessTokenData, get_current_user
from db import get_db
from sqlalchemy.orm import Session
from db.queries.customer import CustomerQuery
from logger import logger
import re
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter(prefix="/customer", tags=["customer"])

# Add Google OAuth Client ID from environment variables or config
from config import get_settings
settings = get_settings()
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_customer(
    request: CustomerRegisterRequest, response: Response, db: Session = Depends(get_db)
) -> APIResponseBase:
    """
    Register a new customer.

    Args:
        request (CustomerRegisterRequest): The request object containing customer details.
        response (Response): The response object to be sent back to the client.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the result of the registration process.
    """

    customer = CustomerQuery.get_customer_by_email(db, request.email)
    if customer:
        logger.error("Customer with this email already exists")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(
            message="Customer with this email already exists"
        )

    customer = CustomerQuery.create_customer(
        db, request.name, request.email, request.password
    )

    if not customer:
        logger.error("Failed to create customer")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(
            message="Failed to create customer"
        )

    db.commit()

    response.status_code = status.HTTP_201_CREATED
    return APIResponseBase.created(
        message="Customer created successfully",
    )


@router.post("/login")
async def login_customer(
    request: CustomerLoginRequest, response: Response, db: Session = Depends(get_db)
) -> APIResponseBase:
    """
    Logs in a customer with the provided email and password.

    Args:
        request (CustomerLoginRequest): The login request object containing the email and password.
        response (Response): The response object to be returned.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the access and refresh tokens.
    """

    customer = CustomerQuery.get_customer_by_email_password(
        db, request.email, request.password
    )

    if not customer:
        logger.error("Invalid email or password")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Invalid email or password")

    access_token_data = {
        "uuid": str(customer.uuid),
        "email": customer.email,
        "name": customer.name,
    }
    refresh_token_data = {
        "uuid": str(customer.uuid),
    }

    access_token = JWTHandler.create_access_token(access_token_data)
    refresh_token = JWTHandler.create_refresh_token(refresh_token_data)

    # update last login
    CustomerQuery.update_customer_last_login(db, customer)

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        data=CustomerLoginResponse(
            access_token=access_token, refresh_token=refresh_token
        ).model_dump(),
        message="Login successful",
    )


@router.post("/refresh-token")
async def refresh_access_token(
    response: Response, authorization: str = Header(None), db: Session = Depends(get_db)
) -> APIResponseBase:
    """
    Refreshes the access token for a customer.

    Args:
        response (Response): The HTTP response object.
        authorization (str, optional): The authorization header containing the refresh token. Defaults to None.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the new access token.

    Raises:
        HTTPException: If the authorization header is missing or invalid, or if the customer is not found.
    """

    if not authorization:
        logger.error("Authorization header is missing")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Authorization header is missing")

    # extract token from header
    refresh_token = re.sub(r"Bearer ", "", authorization)

    refresh_token_decoded: RefreshTokenData = JWTHandler.decode_refresh_token(
        refresh_token
    )
    if not refresh_token_decoded:
        logger.error("Invalid refresh token")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Invalid refresh token")

    customer = CustomerQuery.get_customer_by_uuid(db, refresh_token_decoded.uuid)
    if not customer:
        logger.error("Customer not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Customer not found")

    access_token_data = {
        "uuid": str(customer.uuid),
        "email": customer.email,
        "name": customer.name,
    }

    access_token = JWTHandler.create_access_token(access_token_data)

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        data=CustomerLoginResponse(
            access_token=access_token, refresh_token=refresh_token
        ).model_dump(),
        message="Access token refreshed successfully",
    )


@router.get("/profile")
async def get_customer_profile(
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Get the profile of the current customer.
    """

    customer = CustomerQuery.get_customer_by_uuid(db, current_user.uuid)

    if not customer:
        logger.error("Customer not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Customer not found")
    
    response_data = customer.to_dict()
    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        data=response_data,
        message="Customer found",
    )


@router.put("/profile")
async def update_customer_profile(
    request: CustomerProfileUpdateRequest,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Update the profile of the current customer.
    """

    customer = CustomerQuery.get_customer_by_uuid(db, current_user.uuid)

    if not customer:
        logger.error("Customer not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Customer not found")

    customer = CustomerQuery.update_customer_profile(
        db, current_user.uuid, request.name
    )
    db.commit()

    if not customer:
        logger.error("Failed to update customer profile")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(
            message="Failed to update customer profile"
        )

    db.commit()

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        data=customer.to_dict(),
        message="Customer profile updated successfully",
    )


@router.post("/google-login")
async def google_login(
    request: GoogleLoginRequest,
    response: Response, 
    db: Session = Depends(get_db)
) -> APIResponseBase:
    """
    Logs in a customer with a Google OAuth credential token.
    
    Args:
        request (GoogleLoginRequest): The Google login request object containing the credential token.
        response (Response): The response object to be returned.
        db (Session, optional): The database session. Defaults to Depends(get_db).
    
    Returns:
        APIResponseBase: The API response containing the access and refresh tokens.
    """
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            request.credential, requests.Request(), GOOGLE_CLIENT_ID
        )
        
        # Get user info from the token
        email = idinfo.get('email')
        name = idinfo.get('name')
        email_verified = idinfo.get('email_verified', False)
        
        if not email or not email_verified:
            logger.error("Invalid Google token or email not verified")
            response.status_code = status.HTTP_401_UNAUTHORIZED
            return APIResponseBase.unauthorized(message="Invalid Google token or email not verified")
        
        # Check if user exists
        customer = CustomerQuery.get_customer_by_email(db, email)
        
        # If user doesn't exist, create a new one
        if not customer:
            # Generate a random secure password for the Google user
            import secrets
            import string
            password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
            
            customer = CustomerQuery.create_customer(
                db, name, email, password, is_google_user=True
            )
            
            if not customer:
                logger.error("Failed to create customer from Google login")
                response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
                return APIResponseBase.internal_server_error(
                    message="Failed to create customer from Google login"
                )
                
            db.commit()
        
        # Generate tokens
        access_token_data = {
            "uuid": str(customer.uuid),
            "email": customer.email,
            "name": customer.name,
        }
        refresh_token_data = {
            "uuid": str(customer.uuid),
        }
        
        access_token = JWTHandler.create_access_token(access_token_data)
        refresh_token = JWTHandler.create_refresh_token(refresh_token_data)
        
        # Update last login
        CustomerQuery.update_customer_last_login(db, customer)
        
        response.status_code = status.HTTP_200_OK
        return APIResponseBase.success_response(
            data=CustomerLoginResponse(
                access_token=access_token, refresh_token=refresh_token
            ).model_dump(),
            message="Google login successful",
        )
        
    except ValueError:
        # Invalid token
        logger.error("Invalid Google token")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Invalid Google token")
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(
            message=f"Google login error: {str(e)}"
        )
