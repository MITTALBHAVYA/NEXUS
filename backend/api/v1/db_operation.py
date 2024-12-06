from fastapi import APIRouter, status, Depends, Response
from data_response.base_response import APIResponseBase
from schemas.db_config import (
    NewDBCreateRequest,
    NewDBCreateResponse,
    DBConfigUpdateRequest,
)
from db.queries.chat_history import ChatHistoryQuery
from helper.auth import JWTHandler, AccessTokenData, get_current_user
from db import get_db
from sqlalchemy.orm import Session
from db.queries.db_config import DBConfigQuery
from logger import logger
from helper.pipelines.db_query import get_db_connection_string
from sqlalchemy import create_engine, text


router = APIRouter(prefix="/db-operation", tags=["db_operation"])


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_new_db(
    request: NewDBCreateRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: AccessTokenData = Depends(get_current_user),
) -> APIResponseBase:
    """
    Create a new database configuration.

    Args:
        request (NewDBCreateRequest): The request object containing the details of the new database configuration.
        response (Response): The response object to be returned.
        db (Session, optional): The database session. Defaults to Depends(get_db).
        current_user (AccessTokenData, optional): The current user. Defaults to Depends(get_current_user).

    Returns:
        APIResponseBase: The API response containing the result of the operation.
    """

    logger.debug(f"Request: {request}")
    db_config = DBConfigQuery.create_db_config(
        db, current_user.uuid, request.db_type, request.db_config
    )

    if not db_config:
        logger.error("Failed to create db config")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(
            message="Failed to create db config"
        )

    chat_history = ChatHistoryQuery.create_new_chat_history(
        db,
        current_user.uuid,
        "db",
        db_config.id,
        request.db_type + " : " + request.db_config["dbname"],
    )

    db.commit()

    response.status_code = status.HTTP_201_CREATED
    return APIResponseBase.created(
        message="DB config created successfully",
        data=NewDBCreateResponse(
            db_config_id=db_config.id,
            message="DB config created successfully",
            chat_uuid=str(chat_history.uuid),
        ),
    )


@router.get("/")
async def get_db_config(
    response: Response,
    db: Session = Depends(get_db),
    current_user: AccessTokenData = Depends(get_current_user),
) -> APIResponseBase:
    """
    Retrieves the database configuration for the current user.

    Args:
        response (Response): The response object.
        db (Session): The database session.
        current_user (AccessTokenData): The access token data for the current user.

    Returns:
        APIResponseBase: The API response containing the database configuration.

    Raises:
        HTTPException: If the database configuration is not found.
    """

    db_configs = DBConfigQuery.get_db_config_by_customer_uuid(db, current_user.uuid)

    if not db_configs:
        logger.error("DB config not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="DB config not found")

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="DB config found",
        data={
            "db_configs": db_configs,
            "customer_uuid": current_user.uuid,
        },
    )


@router.post("/test-connection")
async def test_db_connection(
    request: NewDBCreateRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: AccessTokenData = Depends(get_current_user),
) -> APIResponseBase:
    """
    Test the connection to a new database configuration.

    Args:
        request (NewDBCreateRequest): The request object containing the details of the new database configuration.
        response (Response): The response object to be returned.
        db (Session, optional): The database session. Defaults to Depends(get_db).
        current_user (AccessTokenData, optional): The current user. Defaults to Depends(get_current_user).

    Returns:
        APIResponseBase: The API response determining the success of the connection test.
    """

    db_url = get_db_connection_string(
        request.db_type,
        request.db_config["user"],
        request.db_config["password"],
        request.db_config["hostname"],
        request.db_config["port"],
        request.db_config["dbname"],
    )

    engine = create_engine(db_url)

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1;"))
    except Exception as e:
        logger.error(f"Failed to connect to db: {e}")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Failed to connect to db")

    return APIResponseBase.success_response(
        message="DB connection successful", data={"status": "success"}
    )


@router.put("/{db_config_id}")
async def update_db_config(
    db_config_id: int,
    request: DBConfigUpdateRequest,
    response: Response,
    db: Session = Depends(get_db),
    current_user: AccessTokenData = Depends(get_current_user),
) -> APIResponseBase:
    """
    Update an existing database configuration.
    """

    db_config = DBConfigQuery.get_db_config_by_id(db, db_config_id, current_user.uuid)

    if not db_config:
        logger.error("DB config not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="DB config not found")

    db_config = DBConfigQuery.update_db_config_by_id(
        db, db_config_id, request.db_type, request.db_config
    )

    if not db_config:
        logger.error("Failed to update db config")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Failed to update db config")

    db.commit()

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="DB config updated successfully",
        data={
            "db_config_id": db_config.to_dict(),
            "message": "DB config updated successfully",
        },
    )


@router.delete("/{db_config_id}")
async def delete_db_config(
    db_config_id: int,
    response: Response,
    db: Session = Depends(get_db),
    current_user: AccessTokenData = Depends(get_current_user),
) -> APIResponseBase:
    """
    Delete a database configuration.
    """

    db_config = DBConfigQuery.get_db_config_by_id(db, db_config_id, current_user.uuid)
    if not db_config:
        logger.error("DB config not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="DB config not found")

    chat_history = ChatHistoryQuery.get_chat_history(
        db, current_user.uuid, "db", db_config_id
    )

    DBConfigQuery.delete_db_config_by_id(db, db_config_id)
    ChatHistoryQuery.delete_chat_history_by_uuid(db, chat_history.uuid)
    db.commit()

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="DB config deleted successfully",
        data={
            "message": "DB config deleted successfully",
        },
    )
