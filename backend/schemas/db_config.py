from pydantic import BaseModel, field_validator
from typing import List, Optional


class NewDBCreateRequest(BaseModel):
    """
    Represents a request to create a new database.

    Attributes:
        db_type (str): The type of the database.
        db_config (dict): The configuration details for the database.
    """

    db_type: str
    db_config: dict

    @field_validator("db_type")
    def check_db_type(cls, value):
        if value not in ["mysql", "postgres", "sqlite"]:
            raise ValueError("Invalid db_type")
        return value


class NewDBCreateResponse(BaseModel):
    """
    Represents the response for creating a new database configuration.

    Attributes:
        db_config_id (int): The ID of the newly created database configuration.
        message (str): A message describing the result of the creation process.
    """

    db_config_id: int
    message: str
    chat_uuid: str

class DBConfigUpdateRequest(BaseModel):
    """
    Represents a request to update a database configuration.

    Attributes:
        db_type (str): The type of the database.
        db_config (dict): The configuration details for the database.
    """

    db_type: str
    db_config: dict

    @field_validator("db_type")
    def check_db_type(cls, value):
        if value not in ["mysql", "postgres", "sqlite"]:
            raise ValueError("Invalid db_type")
        return value