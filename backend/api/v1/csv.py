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
from db.models.user_document import UserDocument
from db.queries.chat_history import ChatHistoryQuery
from db.queries.chart import ChartQuery
from schemas.user_documents import UserDocumentUploadResponse, UserDocumentUpdateRequest
from sqlalchemy.orm import Session
from config import Config
import random
import os, io
from helper.openai import create_document_embedding
from helper.aws_s3 import upload_obj_to_s3, download_from_s3, delete_s3_obj


router = APIRouter(prefix="/csv", tags=["csv"])


def process_embedding(db: Session, csv_doc: UserDocument) -> bool:
    """
    Process the embedding for a given CSV document.

    Args:
        db (Session): The database session.
        csv_doc (UserDocument): The CSV document to process.

    Returns:
        bool: True if the embedding was successfully created, False otherwise.
    """
    try:
        logger.debug(f"Creating Embedding for doc id {csv_doc.id}")
        embedding_path = create_document_embedding(
            document_path=csv_doc.document_url, customer_uuid=csv_doc.customer_uuid
        )
        UserDocumentQuery.update_embedding_path(db, csv_doc.id, embedding_path)
        db.commit()
        logger.debug(f"Embedding created for doc id {csv_doc.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to create document embedding: {e}")
        return False


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Uploads a CSV file and processes it.

    Args:
        file (UploadFile): The CSV file to upload.
        background_tasks (BackgroundTasks): Background tasks to be executed.
        response (Response): The HTTP response object.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the status and data.
    """

    logger.debug(f"Request: {file.filename}")

    # Check the file mime type
    if file.content_type != "text/csv":
        logger.error("Invalid file type")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return APIResponseBase.bad_request(message="Invalid file type")

    # Save the file with in tmp folder
    # filename = f"./tmp/{random.randbytes(8).hex()}.csv"
    # with open(filename, "wb") as f:
    #     f.write(file.file.read())
    # upload the file to s3
    s3_file_upload_url = upload_obj_to_s3(
        file.file, file.filename, f"{current_user.uuid}/csv"
    )
    if not s3_file_upload_url:
        logger.error("Failed to upload file to s3")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(message="Failed to upload file")

    new_csv_doc = UserDocumentQuery.create_user_document(
        db, current_user.uuid, "csv", file.filename, s3_file_upload_url, "processing"
    )

    if not new_csv_doc:
        logger.error("Failed to create csv document")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(
            message="Failed to create csv document"
        )

    chat_history = ChatHistoryQuery.create_new_chat_history(
        db, current_user.uuid, "csv", new_csv_doc.id, new_csv_doc.document_name
    )

    db.commit()
    # background_tasks.add_task(process_embedding, db, new_csv_doc)

    response.status_code = status.HTTP_201_CREATED
    return APIResponseBase.created(
        message="CSV file uploaded successfully",
        data=UserDocumentUploadResponse(
            document_id=new_csv_doc.id,
            document_name=new_csv_doc.document_name,
            document_type=new_csv_doc.document_type,
            chat_uuid=str(chat_history.uuid),
        ),
    )


@router.get("/download/{document_id}")
async def download_csv_document(
    document_id: int,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """
    Downloads the CSV document with the given ID.

    Args:
        document_id (int): The ID of the CSV document to download.
        response (Response): The HTTP response object.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        StreamingResponse: The streaming response containing the CSV file.
    """

    csv_doc = UserDocumentQuery.get_user_document_by_id(db, document_id, "csv")

    if not csv_doc:
        logger.error("CSV document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="CSV document not found")

    if str(csv_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    # download the file from s3
    # extract object url from s3 url
    object_url = csv_doc.document_url.split("amazonaws.com/")[-1]
    download_status = download_from_s3(object_url)
    if not download_status:
        logger.error("Failed to download file from s3")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(
            message="Failed to download file from s3"
        )

    # return the file
    file_name = csv_doc.document_name
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
async def get_csv_document(
    document_id: int,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Retrieves the CSV document with the given ID.

    Args:
        document_id (int): The ID of the CSV document to retrieve.
        response (Response): The HTTP response object.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the status and data.
    """

    csv_doc = UserDocumentQuery.get_user_document_by_id(db, document_id, "csv")
    chat_history = ChatHistoryQuery.get_chat_history(
        db, csv_doc.customer_uuid, "csv", csv_doc.id
    )

    if not csv_doc:
        logger.error("CSV document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="CSV document not found")

    if str(csv_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="CSV document retrieved successfully",
        data=UserDocumentUploadResponse(
            document_id=csv_doc.id,
            document_name=csv_doc.document_name,
            document_type=csv_doc.document_type,
            chat_uuid=str(chat_history.uuid),
        ),
    )


@router.put("/{document_id}")
def update_csv_document_name(
    document_id: int,
    request: UserDocumentUpdateRequest,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Updates the name of the CSV document with the given ID.

    Args:
        document_id (int): The ID of the CSV document to update.
        request (UserDocumentUpdateRequest): The request object containing the new name.
        response (Response): The HTTP response object.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the status and data.
    """

    csv_doc = UserDocumentQuery.get_user_document_by_id(db, document_id)

    if not csv_doc:
        logger.error("CSV document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="CSV document not found")

    if str(csv_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    UserDocumentQuery.update_user_document(db, document_id, request.document_name)
    db.commit()

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="CSV document updated successfully",
        data=UserDocumentUploadResponse(
            document_id=csv_doc.id,
            document_name=request.document_name,
            document_type=csv_doc.document_type,
        ),
    )


@router.delete("/{document_id}")
def delete_csv_document(
    document_id: int,
    response: Response,
    current_user: AccessTokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponseBase:
    """
    Deletes the CSV document with the given ID.

    Args:
        document_id (int): The ID of the CSV document to delete.
        response (Response): The HTTP response object.
        current_user (AccessTokenData, optional): The current user's access token data. Defaults to Depends(get_current_user).
        db (Session, optional): The database session. Defaults to Depends(get_db).

    Returns:
        APIResponseBase: The API response containing the status and data.
    """

    csv_doc = UserDocumentQuery.get_user_document_by_id(db, document_id)

    if not csv_doc:
        logger.error("CSV document not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return APIResponseBase.not_found(message="CSV document not found")

    if str(csv_doc.customer_uuid) != current_user.uuid:
        logger.error("Unauthorized access")
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return APIResponseBase.unauthorized(message="Unauthorized access")

    chat_history = ChatHistoryQuery.get_chat_history(
        db, csv_doc.customer_uuid, "csv", csv_doc.id
    )

    # delete the file
    # os.remove(csv_doc.document_url)
    object_url = csv_doc.document_url.split("amazonaws.com/")[-1]
    s3_delete_status = delete_s3_obj(object_url)
    if not s3_delete_status:
        logger.error("Failed to delete file from s3")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponseBase.internal_server_error(message="Failed to delete file")
    
    if chat_history:
        ChartQuery.delete_chart_by_chat_uuid(db, str(chat_history.uuid))
        ChatHistoryQuery.delete_chat_history_by_uuid(db, chat_history.uuid)

    UserDocumentQuery.delete_user_document(db, document_id)
    db.commit()

    response.status_code = status.HTTP_200_OK
    return APIResponseBase.success_response(
        message="CSV document deleted successfully",
        data=UserDocumentUploadResponse(
            document_id=csv_doc.id,
            document_name=csv_doc.document_name,
            document_type=csv_doc.document_type,
        ),
    )
