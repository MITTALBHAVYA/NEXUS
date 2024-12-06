from pydantic import BaseModel, EmailStr, model_validator
from typing import List, Optional
from fastapi import HTTPException, status


class CustomerRegisterRequest(BaseModel):
    """
    Represents the request model for customer registration.
    """

    name: str
    email: EmailStr
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def password_match(cls, v):
        """
        Validates if the password and confirm password fields match.

        Args:
            v: The current instance of the model.

        Raises:
            HTTPException: If the password and confirm password do not match.

        Returns:
            The validated instance of the model.
        """
        if v.password != v.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password and confirm password do not match",
            )
        return v


class CustomerRegisterResponse(BaseModel):
    """
    Represents the response model for customer registration.
    """

    message: str
    data: Optional[dict]


class CustomerLoginRequest(BaseModel):
    """
    Represents the request model for customer login.
    """

    email: EmailStr
    password: str


class CustomerLoginResponse(BaseModel):
    """
    Represents the response model for customer login.
    """

    access_token: str
    refresh_token: str


class CustomerProfileUpdateRequest(BaseModel):
    """
    Represents the request model for updating the customer profile.
    """

    name: str
