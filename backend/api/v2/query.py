from fastapi import APIRouter, status, Depends, Response
from data_response.base_response import APIResponseBase
from helper.auth import AccessTokenData, get_current_user
from schemas.query import CustomerQueryRequest, CustomerQueryResponse
from db.queries.chat_history import ChatHistoryQuery
from db.queries.user_documents import UserDocumentQuery
from db import get_db
from sqlalchemy.orm import Session
from logger import logger
from helper.pipelines.csv_query import csv_pipeline_v2
from helper.pipelines.chart_query import chart_query_pipeline
from helper.pipelines.check_chart_query import is_chart_related_query
from helper.aws_s3 import download_from_s3
from helper.constants import AVAILABLE_LLM_MODELS
import random, os


router = APIRouter(prefix="/query", tags=["query"])


@router.post("/{query_type}")
async def query(
    query_type: str,
    request: CustomerQueryRequest,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Executes a query based on the given query type and returns the API response.

    Parameters:
    - query_type (str): The type of query to execute.
    - request (CustomerQueryRequest): The request object containing query details.
    - response (Response): The response object to be returned.
    - current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
    - db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
    - APIResponseBase: The API response containing the query result.

    Raises:
    - BadRequestException: If the query type is invalid.
    - UnauthorizedException: If the user does not have access to the CSV file.
    """

    logger.debug(f"Using LLM : {request.model}")
    result = None

    if not ChatHistoryQuery.is_valid_chat_history(
        db,
        str(request.chat_uuid),
        query_type,
        current_user.uuid,
        request.data_source_id,
    ):
        logger.error("Invalid chat history")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Invalid chat uuid")
    
    # check if the model is valid
    if request.model not in AVAILABLE_LLM_MODELS:
        logger.error("Invalid model")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Invalid model")

    if query_type == "csv":
        logger.debug(f"Received query for CSV")

        csv_file = UserDocumentQuery.get_user_document_by_id(db, request.data_source_id)
        if not csv_file:
            logger.error("CSV file not found")
            return APIResponseBase.bad_request(message="CSV file not found")

        if str(csv_file.customer_uuid) != current_user.uuid:
            logger.error("Unauthorized access")
            return APIResponseBase.unauthorized(message="Unauthorized access")

        # check if the query is related to chart
        check_chart_query = False
        try:
            check_chart_query = is_chart_related_query(request.query, str(request.chat_uuid))
        except Exception as e:
            logger.error(f"Failed to check chart query: {e}")
            logger.info("Proceeding with normal document query")

        logger.debug(f"Is chart related query: {check_chart_query}")

        if check_chart_query:
            try:
                result = chart_query_pipeline(
                    request.query,
                    str(request.chat_uuid),
                    query_type,
                    request.data_source_id,
                    request.model,
                )
                return APIResponseBase.success_response(
                    message="Query successful",
                    data=CustomerQueryResponse(
                        query=request.query,
                        response=result,
                        data_source_id=request.data_source_id,
                        chat_uuid=str(request.chat_uuid),
                    ),
                )
            except Exception as e:
                logger.error(f"Failed to generate chart: {e}")
                response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
                return APIResponseBase.internal_server_error(
                    message="Failed to query chart. Please check your query and try again."
                )

        s3_object_url = csv_file.document_url.split("amazonaws.com/")[-1]
        file_extension = s3_object_url.split(".")[-1]
        temp_file_name = random.randbytes(10).hex() + "." + file_extension
        temp_file_path = f"./tmp/{temp_file_name}"
        if not download_from_s3(s3_object_url, temp_file_path):
            logger.error("Failed to download file from s3")
            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            return APIResponseBase.internal_server_error(
                message="Failed to download file from s3"
            )
        result = csv_pipeline_v2(
            temp_file_path, request.query, str(request.chat_uuid), request.model
        )
        os.remove(temp_file_path)

    else:
        # bad request
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Invalid query type")

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="Query successful",
        data=CustomerQueryResponse(
            query=request.query,
            response=result,
            chat_uuid=str(request.chat_uuid),
            data_source_id=request.data_source_id if query_type == "csv" else None,
        ),
    )
