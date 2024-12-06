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
from db.queries.user_documents import UserDocumentQuery
from db.queries.chat_history import ChatHistoryQuery
from db.queries.chart import ChartQuery
from schemas.user_documents import UserDocumentUploadResponse, UserDocumentUpdateRequest
from sqlalchemy.orm import Session
from config import Config
import random
from helper.openai import create_document_embedding
from helper.aws_s3 import upload_obj_to_s3, download_from_s3, delete_s3_obj
import os, io

router = APIRouter(prefix="/excel", tags=["excel"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:

    logger.debug(f"Request: {file.filename}")

    # Check the file mime type
    if file.content_type not in [
        "application/vnd.ms-excel",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]:
        logger.error("Invalid file type")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Invalid file type")

    # Save the file with
    # filename = f"./tmp/{random.randbytes(8).hex()}.xlsx"
    # with open(filename, "wb") as f:
    #     f.write(file.file.read())
    s3_file_upload_url = upload_obj_to_s3(
        file.file, file.filename, f"{current_user.uuid}/excel"
    )
    if not s3_file_upload_url:
        logger.error("Failed to upload file")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(message="Failed to upload file")

    new_excel_doc = UserDocumentQuery.create_user_document(
        db, current_user.uuid, "excel", file.filename, s3_file_upload_url, "processing"
    )

    if not new_excel_doc:
        logger.error("Failed to create excel document")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(
            message="Failed to create excel document"
        )

    chat_history = ChatHistoryQuery.create_new_chat_history(
        db, current_user.uuid, "excel", new_excel_doc.id, new_excel_doc.document_name
    )

    db.commit()

    response.status_code = status.HTTP_201_CREATED
    return APIResponseBase.created(
        message="Excel file uploaded successfully",
        data=UserDocumentUploadResponse(
            document_id=new_excel_doc.id,
            document_name=new_excel_doc.document_name,
            document_type=new_excel_doc.document_type,
            chat_uuid=str(chat_history.uuid),
        ),
    )


@router.get("/download/{document_id}")
async def download_excel_document(
    document_id: int,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Download the Excel document by its ID.

    Args:
        document_id (int): The ID of the document to download.
        response (Response): The response object to be returned.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the download status.
    """
    excel_doc = UserDocumentQuery.get_user_document_by_id(db, document_id, "excel")
    if not excel_doc:
        logger.error("Excel document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Excel document not found")

    if str(excel_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    # download the file from s3
    # extract object url from s3 url
    object_url = excel_doc.document_url.split("amazonaws.com/")[-1]
    download_status = download_from_s3(object_url)
    if not download_status:
        logger.error("Failed to download file")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(message="Failed to download file")

    # return the data
    file_name = excel_doc.document_name
    file_path = f"./tmp/output/{file_name}"
    file = open(file_path, "rb")
    file_content = io.BytesIO(file.read())
    file.close()
    os.remove(file_path)

    response.headers["Content-Disposition"] = f"attachment; filename={file_name}"
    response.headers["Content-Type"] = "application/octet-stream"
    response.status_code = status.HTTP_200_OK
    return StreamingResponse(file_content, media_type="application/octet-stream")


@router.get("/{document_id}")
async def get_excel_document(
    document_id: int,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Get the Excel document by its ID.

    Args:
        document_id (int): The ID of the document to get.
        response (Response): The response object to be returned.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the document data.
    """
    excel_doc = UserDocumentQuery.get_user_document_by_id(db, document_id, "excel")
    chat_history = ChatHistoryQuery.get_chat_history(
        db, current_user.uuid, "excel", document_id
    )
    if not excel_doc:
        logger.error("Excel document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Excel document not found")

    if str(excel_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    return APIResponseBase.success_response(
        message="Excel document found",
        data=UserDocumentUploadResponse(
            document_id=excel_doc.id,
            document_name=excel_doc.document_name,
            document_type=excel_doc.document_type,
            chat_uuid=str(chat_history.uuid),
        ),
    )


@router.put("/{document_id}")
async def update_excel_document(
    document_id: int,
    request: UserDocumentUpdateRequest,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Update the Excel document by its ID.

    Args:
        document_id (int): The ID of the document to update.
        request (UserDocumentUpdateRequest): The request object containing the new document details.
        response (Response): The response object to be returned.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the updated document data.
    """
    excel_doc = UserDocumentQuery.get_user_document_by_id(db, document_id, "excel")
    if not excel_doc:
        logger.error("Excel document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Excel document not found")

    if str(excel_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    excel_doc = UserDocumentQuery.update_user_document(
        db, document_id, request.document_name
    )

    db.commit()

    return APIResponseBase.success_response(
        message="Excel document updated",
        data=excel_doc.to_dict(),
    )


@router.delete("/{document_id}")
async def delete_excel_document(
    document_id: int,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Delete the Excel document by its ID.

    Args:
        document_id (int): The ID of the document to delete.
        response (Response): The response object to be returned.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the status.
    """
    excel_doc = UserDocumentQuery.get_user_document_by_id(db, document_id, "excel")
    if not excel_doc:
        logger.error("Excel document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="Excel document not found")

    if str(excel_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    chat_history = ChatHistoryQuery.get_chat_history(
        db, current_user.uuid, "excel", excel_doc.id
    )

    # delete the excel file from s3
    object_url = excel_doc.document_url.split("amazonaws.com/")[-1]
    s3_delete_status = delete_s3_obj(object_url)
    if not s3_delete_status:
        logger.error("Failed to delete file")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(message="Failed to delete file")

    if chat_history:
        ChartQuery.delete_chart_by_chat_uuid(db, str(chat_history.uuid))
        ChatHistoryQuery.delete_chat_history_by_uuid(db, chat_history.uuid)
    UserDocumentQuery.delete_user_document(db, document_id)
    db.commit()

    return APIResponseBase.success_response(
        message="Excel document deleted",
    )
