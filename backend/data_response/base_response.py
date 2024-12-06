from pydantic import BaseModel
from fastapi.responses import JSONResponse
from starlette import status
from typing import Any, Optional


class APIResponseBase(BaseModel):
    """
    Base class for API responses.

    Attributes:
        data (Optional[Any]): The response data.
        message (Optional[str]): The response message.
        status_code (Optional[int]): The HTTP status code of the response.

    Methods:
        success_response(cls, data: Any = None, message: str = "Success", status_code: int = 200):
            Creates a success response instance.
        created(cls, data: Any = None, message: str = "Created"):
            Creates a response instance for a successful creation.
        bad_request(cls, message: str = "Bad Request"):
            Creates a response instance for a bad request.
        unauthorized(cls, message: str = "Unauthorized"):
            Creates a response instance for an unauthorized request.
        forbidden(cls, message: str = "Forbidden"):
            Creates a response instance for a forbidden request.
        not_found(cls, message: str = "Not Found"):
            Creates a response instance for a resource not found.
        internal_server_error(cls, message: str = "Internal Server Error"):
            Creates a response instance for an internal server error.
    """

    data: Optional[Any] = None
    message: Optional[str] = None
    status_code: Optional[int] = None

    @classmethod
    def success_response(
        cls, data: Any = None, message: str = "Success", status_code: int = 200
    ):
        """
        Creates a success response instance.

        Args:
            data (Any, optional): The response data. Defaults to None.
            message (str, optional): The response message. Defaults to "Success".
            status_code (int, optional): The HTTP status code of the response. Defaults to 200.

        Returns:
            APIResponseBase: The success response instance.
        """
        return cls(data=data, message=message, status_code=status_code)

    @classmethod
    def created(cls, data: Any = None, message: str = "Created"):
        """
        Creates a response instance for a successful creation.

        Args:
            data (Any, optional): The response data. Defaults to None.
            message (str, optional): The response message. Defaults to "Created".

        Returns:
            APIResponseBase: The response instance for a successful creation.
        """
        return cls(data=data, message=message, status_code=status.HTTP_201_CREATED)

    @classmethod
    def bad_request(cls, message: str = "Bad Request"):
        """
        Creates a response instance for a bad request.

        Args:
            message (str, optional): The response message. Defaults to "Bad Request".

        Returns:
            APIResponseBase: The response instance for a bad request.
        """
        return cls(status_code=status.HTTP_400_BAD_REQUEST, message=message)

    @classmethod
    def unauthorized(cls, message: str = "Unauthorized"):
        """
        Creates a response instance for an unauthorized request.

        Args:
            message (str, optional): The response message. Defaults to "Unauthorized".

        Returns:
            APIResponseBase: The response instance for an unauthorized request.
        """
        return cls(status_code=status.HTTP_401_UNAUTHORIZED, message=message)

    @classmethod
    def forbidden(cls, message: str = "Forbidden"):
        """
        Creates a response instance for a forbidden request.

        Args:
            message (str, optional): The response message. Defaults to "Forbidden".

        Returns:
            APIResponseBase: The response instance for a forbidden request.
        """
        return cls(status_code=status.HTTP_403_FORBIDDEN, message=message)

    @classmethod
    def not_found(cls, message: str = "Not Found"):
        """
        Creates a response instance for a resource not found.

        Args:
            message (str, optional): The response message. Defaults to "Not Found".

        Returns:
            APIResponseBase: The response instance for a resource not found.
        """
        return cls(status_code=status.HTTP_404_NOT_FOUND, message=message)

    @classmethod
    def internal_server_error(cls, message: str = "Internal Server Error"):
        """
        Creates a response instance for an internal server error.

        Args:
            message (str, optional): The response message. Defaults to "Internal Server Error".

        Returns:
            JSONResponse: The response instance for an internal server error.
        """
        return JSONResponse(
            content=cls(
                message=message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            ).dict(),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
