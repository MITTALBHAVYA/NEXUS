from fastapi import APIRouter, status, Depends, Header, Response
from data_response.base_response import APIResponseBase
from db.queries.db_config import DBConfigQuery
from db.queries.user_documents import UserDocumentQuery
from db.queries.chat_history import ChatHistoryQuery
from db import get_db
from helper.auth import AccessTokenData, get_current_user
from logger import logger

router = APIRouter(prefix="/datasource", tags=["datasource"])


@router.get("/")
async def get_datasources(
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db=Depends(get_db),
) -> APIResponseBase:
    """
    Retrieve the datasources for the current user.

    Args:
        response (Response): The response object.
        current_user (AccessTokenData): The access token data for the current user.
        db: The database dependency.

    Returns:
        APIResponseBase: The API response containing the fetched datasources.
    """

    db_configs = DBConfigQuery.get_db_config_by_customer_uuid(db, current_user.uuid)
    user_docs = UserDocumentQuery.get_user_documents_by_customer_uuid(
        db, current_user.uuid
    )
    
    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="Datasources fetched successfully",
        data={
            "db_configs": db_configs,
            "user_docs": user_docs,
            "customer_uuid": current_user.uuid,
        },
    )
