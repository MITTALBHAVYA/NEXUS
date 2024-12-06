from fastapi import APIRouter, status, Depends, Response
from data_response.base_response import APIResponseBase
from db.queries.chat_history import ChatHistoryQuery
from helper.auth import JWTHandler, AccessTokenData, get_current_user
from db import get_db
from sqlalchemy.orm import Session
from logger import logger
from uuid import UUID

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/{chat_uuid}")
async def get_chat_history(
    chat_uuid: UUID,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Get the chat history for a given chat uuid.

    Args:
        chat_uuid (str): The chat uuid for which to get the chat history.
        response (Response): The response object to be returned.
        current_user (AccessTokenData, optional): The current user. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the chat history.
    """
    chat_uuid = str(chat_uuid)

    chat_history = ChatHistoryQuery.get_chat_history_by_uuid(db, chat_uuid)
    if not chat_history:
        logger.error("Chat history not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Chat history not found")

    return APIResponseBase.success_response(
        message="Chat history found",
        data={
            "chat_uuid": chat_uuid,
            "customer_uuid": current_user.uuid,
            "history": chat_history,
        },
    )

@router.get("/")
async def get_all_chat_history(
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Get all chat history for the current user.

    Args:
        response (Response): The response object to be returned.
        current_user (AccessTokenData, optional): The current user. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the chat history.
    """
    chat_history = ChatHistoryQuery.get_all_chat_history(db, current_user.uuid)
    if not chat_history:
        logger.error("Chat history not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Chat history not found")

    return APIResponseBase.success_response(
        message="Chat history found",
        data={
            "customer_uuid": current_user.uuid,
            "history": chat_history,
        },
   )