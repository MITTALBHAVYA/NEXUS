from fastapi import APIRouter, status, Depends, Header, Response
from data_response.base_response import APIResponseBase
from helper.constants import AVAILABLE_LLM_MODELS
from logger import logger


router = APIRouter(prefix="/llm_models", tags=["llm_models"])


@router.get("/")
async def get_llm_models(response: Response) -> APIResponseBase:
    """
    Retrieves the list of LLM models.

    Args:
        response (Response): The response object.

    Returns:
        APIResponseBase: The API response containing the list of LLM models.
    """
    llm_models = AVAILABLE_LLM_MODELS
    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="LLM models fetched successfully", data=llm_models
    )
