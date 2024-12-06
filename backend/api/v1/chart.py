from fastapi import (
    APIRouter,
    status,
    Depends,
    Header,
    UploadFile,
    BackgroundTasks,
    Response,
)
from fastapi.responses import StreamingResponse
from data_response.base_response import APIResponseBase
from helper.auth import get_current_user, AccessTokenData
from logger import logger
from db import get_db
from db.queries.chat_history import ChatHistoryQuery
from db.queries.chart import ChartQuery
from sqlalchemy.orm import Session
from config import Config
import random
import os, io


router = APIRouter(prefix="/chart", tags=["chart"])


@router.get("/chat/{chat_uuid}")
async def get_chart_by_chat_uuid(
    chat_uuid: str,
    response: Response,
    db: Session = Depends(get_db),
    current_user: AccessTokenData = Depends(get_current_user),
) -> APIResponseBase:
    """
    Get the chart data for the given chat UUID.

    Args:
        chat_uuid (str): The chat UUID.
        response (Response): The response object.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the chart data.
    """

    charts = ChartQuery.get_chart_by_chat_uuid(db, chat_uuid)
    if not charts:
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Chart not found")

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="Chart data fetched successfully",
        data=[chart.to_dict() for chart in charts],
    )


@router.get("/{chart_uuid}")
async def get_chart_by_uuid(
    chart_uuid: str,
    response: Response,
    db: Session = Depends(get_db),
    current_user: AccessTokenData = Depends(get_current_user),
) -> APIResponseBase:
    """
    Get the chart data for the given chart UUID.

    Args:
        chart_uuid (str): The chart UUID.
        response (Response): The response object.
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the chart data.
    """

    chart = ChartQuery.get_chart_by_uuid(db, chart_uuid)
    if not chart:
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Chart not found")

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="Chart data fetched successfully",
        data=chart.to_dict(),
    )
