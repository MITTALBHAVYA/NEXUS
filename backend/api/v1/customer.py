from fastapi import APIRouter, status, Depends, Header, Response
from data_response.base_response import APIResponseBase
from schemas.customer import (
    CustomerLoginRequest,
    CustomerLoginResponse,
    CustomerRegisterRequest,
    CustomerRegisterResponse,
    CustomerProfileUpdateRequest,
)
from helper.auth import JWTHandler, RefreshTokenData, AccessTokenData, get_current_user
from db import get_db
from sqlalchemy.orm import Session
from db.queries.customer import CustomerQuery
from logger import logger
import re

router = APIRouter(prefix="/customer", tags=["customer"])


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

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        data=customer.to_dict(),
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
