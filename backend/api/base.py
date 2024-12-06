from fastapi import APIRouter, status, Response
from data_response.base_response import APIResponseBase
from logger import logger


from api.v1 import customer
from api.v1 import db_operation
from api.v1 import csv
from api.v1 import query
from api.v1 import llm_models
from api.v1 import datasource
from api.v1 import excel
from api.v1 import query_suggestions
from api.v1 import chat
from api.v1 import chart
from api.v2 import query as query_v2

router = APIRouter()

router.include_router(customer.router, prefix="/v1")
router.include_router(db_operation.router, prefix="/v1")
router.include_router(csv.router, prefix="/v1")
router.include_router(query.router, prefix="/v1")
router.include_router(llm_models.router, prefix="/v1")
router.include_router(datasource.router, prefix="/v1")
router.include_router(query_suggestions.router, prefix="/v1")
router.include_router(excel.router, prefix="/v1")
router.include_router(chart.router, prefix="/v1")
router.include_router(chat.router, prefix="/v1")

router.include_router(query_v2.router, prefix="/v2")

@router.get("/health")
async def get_system_health(response: Response) -> APIResponseBase:
    """
    Get the system health status.

    This function checks the system health and returns an APIResponseBase object
    with the system health status.

    Args:
        response (Response): The response object to be modified.

    Returns:
        APIResponseBase: An APIResponseBase object with the system health status.

    """
    logger.info("Checking system health")
    # health logic will be added later here
    logger.info("System is healthy")

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="System is healthy",
        data={"status": "UP"}
    )
