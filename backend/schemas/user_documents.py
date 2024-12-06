from pydantic import BaseModel
from typing import Optional

class UserDocumentUploadResponse(BaseModel):
    """
    Represents the response for a user document upload.

    Attributes:
        document_id (int): The ID of the uploaded document.
        document_name (str): The name of the uploaded document.
        document_type (str): The type of the uploaded document.
    """

    document_id: int
    document_name: str
    document_type: str
    chat_uuid: Optional[str] = None


class UserDocumentUpdateRequest(BaseModel):
    """
    Represents a request to update a user document.

    Attributes:
        document_name (str): The new name for the document.
    """

    document_name: str