from sqlalchemy.orm import Session
from db.models.user_document import UserDocument
from db.models.chat_history import ChatHistory
from typing import List


class UserDocumentQuery:
    @staticmethod
    def create_user_document(
        db: Session,
        customer_uuid: str,
        document_type: str,
        document_name: str,
        document_url: str,
        embed_url: str,
    ) -> UserDocument:
        """
        Create a new user document and save it to the database.

        Args:
            db (Session): The database session.
            customer_uuid (str): The UUID of the customer.
            document_type (str): The type of the document.
            document_name (str): The name of the document.
            document_url (str): The URL of the document.
            embed_url (str): The URL for embedding the document.

        Returns:
            UserDocument: The created user document.
        """
        user_document = UserDocument(
            customer_uuid=customer_uuid,
            document_type=document_type,
            document_name=document_name,
            document_url=document_url,
            embed_url=embed_url,
        )
        db.add(user_document)
        db.flush()
        return user_document

    @staticmethod
    def get_user_document_by_id(
        db: Session, user_document_id: int, doc_type: str = None
    ) -> UserDocument:
        """
        Retrieve a user document by its ID.

        Args:
            db (Session): The database session.
            user_document_id (int): The ID of the user document.

        Returns:
            UserDocument: The retrieved user document.
        """
        if doc_type:
            return (
                db.query(UserDocument)
                .filter(
                    UserDocument.id == user_document_id,
                    UserDocument.document_type == doc_type,
                )
                .first()
            )
        return (
            db.query(UserDocument).filter(UserDocument.id == user_document_id).first()
        )

    @staticmethod
    def get_user_documents_by_customer_uuid(
        db: Session, customer_uuid: str
    ) -> List[UserDocument]:
        """
        Retrieve all user documents for a given customer UUID.

        Args:
            db (Session): The database session.
            customer_uuid (str): The UUID of the customer.

        Returns:
            List[UserDocument]: A list of user documents.
        """
        data = (
            db.query(UserDocument)
            .with_entities(
                UserDocument.id,
                UserDocument.customer_uuid,
                UserDocument.document_type,
                UserDocument.document_name,
                UserDocument.created_at,
                UserDocument.updated_at,
                ChatHistory.uuid.label("chat_uuid"),
            )
            .join(ChatHistory, ChatHistory.data_source_id == UserDocument.id)
            .filter(UserDocument.customer_uuid == customer_uuid, ChatHistory.query_type != "db")
            .all()
        )
        dict_data = [
            {
                "id": d.id,
                "customer_uuid": d.customer_uuid,
                "document_type": d.document_type,
                "document_name": d.document_name,
                "created_at": d.created_at,
                "updated_at": d.updated_at,
                "chat_uuid": d.chat_uuid,
            }
            for d in data
        ]
        return dict_data

    @staticmethod
    def update_embedding_path(db: Session, user_document_id: int, embedding_path: str):
        """
        Update the embedding path of a user document.

        Args:
            db (Session): The database session.
            user_document_id (int): The ID of the user document.
            embedding_path (str): The new embedding path.

        Returns:
            UserDocument: The updated user document.
        """
        user_document = (
            db.query(UserDocument).filter(UserDocument.id == user_document_id).first()
        )
        user_document.embed_url = embedding_path
        user_document.is_embedded = True
        db.flush()
        return user_document

    @staticmethod
    def delete_user_document(db: Session, user_document_id: int) -> bool:
        """
        Delete a user document from the database.

        Args:
            db (Session): The database session.
            user_document_id (int): The ID of the user document.

        Returns:
            bool: True if the user document was successfully deleted, False otherwise.
        """
        user_document = (
            db.query(UserDocument).filter(UserDocument.id == user_document_id).first()
        )
        if user_document:
            db.delete(user_document)
            db.flush()
            return True
        return False

    @staticmethod
    def update_user_document(
        db: Session, user_document_id: int, document_name: str = None
    ) -> UserDocument:
        """
        Update the name of a user document.

        Args:
            db (Session): The database session.
            user_document_id (int): The ID of the user document.
            document_name (str): The new name of the document.

        Returns:
            UserDocument: The updated user document.
        """
        user_document = (
            db.query(UserDocument).filter(UserDocument.id == user_document_id).first()
        )
        if document_name:
            user_document.document_name = document_name
        db.flush()
        return user_document
