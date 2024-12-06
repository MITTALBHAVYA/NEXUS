import jwt
import datetime
from typing import Optional
from pydantic import BaseModel
from config import Config
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status, Depends

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="customer/login")


async def get_current_user(token: str):
    """
    Get the current user based on the provided access token.

    Args:
        token (str): The access token.

    Returns:
        dict: The payload of the access token.

    Raises:
        HTTPException: If the credentials cannot be validated.
    """
    try:
        payload = JWTHandler.decode_access_token(token)
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


class AccessTokenData(BaseModel):
    """
    Represents the data contained in an access token.
    """
    uuid: str
    email: str
    name: str


class RefreshTokenData(BaseModel):
    """
    Represents the data contained in a refresh token.
    """
    uuid: str


class JWTHandler:
    """
    Helper class for handling JWT tokens.
    """
    SECRET_KEY = Config.JWT_SECRET_KEY
    ALGORITHM = Config.JWT_ALGORITHM

    @staticmethod
    def create_access_token(data: dict):
        """
        Create an access token based on the provided data.

        Args:
            data (dict): The data to be encoded in the token.

        Returns:
            str: The encoded access token.
        """
        to_encode = data.copy()
        expire = datetime.datetime.utcnow() + datetime.timedelta(
            minutes=Config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, JWTHandler.SECRET_KEY, algorithm=JWTHandler.ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict):
        """
        Create a refresh token based on the provided data.

        Args:
            data (dict): The data to be encoded in the token.

        Returns:
            str: The encoded refresh token.
        """
        to_encode = data.copy()
        expire = datetime.datetime.utcnow() + datetime.timedelta(
            days=Config.JWT_REFRESH_TOKEN_EXPIRE_MINUTES
        )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, JWTHandler.SECRET_KEY, algorithm=JWTHandler.ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def decode_access_token(token: str):
        """
        Decode the provided access token.

        Args:
            token (str): The access token to decode.

        Returns:
            AccessTokenData: The decoded access token.

        Raises:
            jwt.PyJWTError: If the token cannot be decoded.
        """
        try:
            payload = jwt.decode(
                token, JWTHandler.SECRET_KEY, algorithms=[JWTHandler.ALGORITHM]
            )
            return AccessTokenData(**payload)
        except jwt.PyJWTError as e:
            raise e

    @staticmethod
    def decode_refresh_token(token: str):
        """
        Decode the provided refresh token.

        Args:
            token (str): The refresh token to decode.

        Returns:
            RefreshTokenData: The decoded refresh token.

        Raises:
            jwt.PyJWTError: If the token cannot be decoded.
        """
        try:
            payload = jwt.decode(
                token, JWTHandler.SECRET_KEY, algorithms=[JWTHandler.ALGORITHM]
            )
            return RefreshTokenData(**payload)
        except jwt.PyJWTError:
            return None
