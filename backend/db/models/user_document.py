from db import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, UUID, ForeignKey, Boolean
from datetime import datetime


class UserDocument(Base):
    """
    Represents a user document.

    Attributes:
        id (int): The unique identifier of the document.
        customer_uuid (UUID): The UUID of the customer associated with the document.
        document_type (str): The type of the document.
        document_name (str): The name of the document.
        document_url (str): The URL of the document.
        is_embedded (bool): Indicates whether the document is embedded.
        embed_url (str): The URL of the embedded document.
        created_at (datetime): The timestamp when the document was created.
        updated_at (datetime): The timestamp when the document was last updated.
    """

    __tablename__ = "user_documents"

    id = Column(Integer, primary_key=True, index=True)
    customer_uuid = Column(
        UUID(as_uuid=True), ForeignKey("customers.uuid"), nullable=False
    )
    document_type = Column(String, nullable=False)
    document_name = Column(String, nullable=False)
    document_url = Column(String, nullable=False)
    is_embedded = Column(Boolean, default=False)
    embed_url = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self):
        """
        Converts the UserDocument object to a dictionary.

        Returns:
            dict: A dictionary representation of the UserDocument object.
        """
        return {
            "id": self.id,
            "document_type": self.document_type,
            "document_name": self.document_name,
            "document_url": self.document_url,
            "is_embedded": self.is_embedded,
            "embed_url": self.embed_url,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
