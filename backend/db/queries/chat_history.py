from sqlalchemy.orm import Session
from db.models import ChatHistory, DBConfig, UserDocument
from fastapi import HTTPException, status
from datetime import datetime
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.llms import ChatMessage
from llama_index.storage.chat_store.redis import RedisChatStore
from helper.pipelines import post_processed_html_response
from helper.postgres_chat_store import PostgreSQLChatStore
from config import Config


class ChatHistoryQuery:

    @staticmethod
    def create_new_chat_history(
        db: Session,
        customer_uuid: str,
        query_type: str,
        data_source_id: int,
        title: str,
    ):
        """
        Creates a new chat history record in the database.

        Args:
            db (Session): The database session.
            customer_uuid (UUID): The UUID of the customer.
            query_type (str): The type of the query.
            data_source_id (int): The ID of the data source.
            title (str): The title of the chat history.

        Returns:
            ChatHistory: The created chat history object.
        """
        chat_history = ChatHistory(
            customer_uuid=customer_uuid,
            query_type=query_type,
            data_source_id=data_source_id,
            title=title,
        )
        db.add(chat_history)
        db.flush()

        return chat_history

    @staticmethod
    def get_chat_history(
        db: Session, customer_uuid: str, query_type: str, data_source_id: int
    ):
        """
        Retrieves a chat history record from the database.

        Args:
            db (Session): The database session.
            customer_uuid (UUID): The UUID of the customer.
            query_type (str): The type of the query.
            data_source_id (int): The ID of the data source.

        Returns:
            ChatHistory: The chat history object if found, None otherwise.
        """
        return (
            db.query(ChatHistory)
            .filter(
                ChatHistory.customer_uuid == customer_uuid,
                ChatHistory.query_type == query_type,
                ChatHistory.data_source_id == data_source_id,
            )
            .first()
        )

    @staticmethod
    def get_chat_history_by_uuid(db: Session, chat_uuid: str):
        chat_history = (
            db.query(ChatHistory).filter(ChatHistory.uuid == chat_uuid).first()
        )
        if chat_history is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat history NOT found",
            )
        # chat_store = RedisChatStore(redis_url=Config.REDIS_STORE_URL)
        chat_store = PostgreSQLChatStore(
            db_config={
                "dbname": Config.POSTGRES_DB,
                "user": Config.POSTGRES_USER,
                "password": Config.POSTGRES_PASSWORD,
                "host": Config.POSTGRES_HOSTNAME,
                "port": Config.POSTGRES_PORT,
            }
        )
        chat_memory_buffer = ChatMemoryBuffer.from_defaults(
            chat_store=chat_store, chat_store_key=chat_uuid, token_limit=15000
        )
        chat_messages = chat_memory_buffer.get()
        # list of messages with role and content
        chat_history_list = [
            {
                "role": chat_message.role,
                "content": post_processed_html_response(chat_message.content),
                "extras": chat_message.additional_kwargs or {},
            }
            for chat_message in chat_messages
        ]
        return {
            "title": chat_history.title,
            "query_type": chat_history.query_type,
            "messages": chat_history_list,
        }

    @staticmethod
    def is_valid_chat_history(
        db: Session,
        chat_uuid: str,
        query_type: str,
        customer_uuid: str,
        data_source_id: int,
    ):
        """
        Checks if a chat history record is valid.

        Args:
            db (Session): The database session.
            chat_uuid (str): The UUID of the chat history record.
            query_type (str): The type of the query.
            customer_uuid (str): The UUID of the customer.
            data_source_id (int): The ID of the data source.

        Returns:
            bool: True if the chat history record is valid, False otherwise.
        """
        chat_history = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.uuid == chat_uuid,
                ChatHistory.customer_uuid == customer_uuid,
                ChatHistory.query_type == query_type,
                ChatHistory.data_source_id == data_source_id,
            )
            .first()
        )

        if chat_history:
            return True
        return False

    def get_all_chat_history(db: Session, customer_uuid: str):
        # return list of chat history along with joins
        # with DBconfig and UserDocument
        db_chat_history = (
            db.query(ChatHistory)
            .with_entities(
                ChatHistory.uuid,
                ChatHistory.title,
                ChatHistory.query_type,
                ChatHistory.created_at,
                DBConfig.id,
                DBConfig.db_type,
            )
            .join(DBConfig, ChatHistory.data_source_id == DBConfig.id)
            .filter(
                ChatHistory.customer_uuid == customer_uuid,
                ChatHistory.query_type == "db",
            )
            .order_by(ChatHistory.created_at.desc())
            .all()
        )
        doc_chat_history = (
            db.query(ChatHistory)
            .with_entities(
                ChatHistory.uuid,
                ChatHistory.title,
                ChatHistory.query_type,
                ChatHistory.created_at,
                UserDocument.id,
                UserDocument.document_name,
            )
            .join(UserDocument, ChatHistory.data_source_id == UserDocument.id)
            .filter(
                ChatHistory.customer_uuid == customer_uuid,
                ChatHistory.query_type.in_(["csv", "excel"]),
            )
            .order_by(ChatHistory.created_at.desc())
            .all()
        )
        normal_chat_history = (
            db.query(ChatHistory)
            .with_entities(
                ChatHistory.uuid,
                ChatHistory.title,
                ChatHistory.query_type,
                ChatHistory.created_at,
            )
            .filter(
                ChatHistory.customer_uuid == customer_uuid,
                ChatHistory.query_type == "chat",
            )
            .order_by(ChatHistory.created_at.desc())
            .all()
        )
        chat_history = {"db": None, "doc": None, "chat": None}

        if db_chat_history:
            chat_history["db"] = [
                {
                    "uuid": chat.uuid,
                    "title": chat.title,
                    "query_type": chat.query_type,
                    "created_at": chat.created_at,
                    "db_id": chat.id,
                    "db_type": chat.db_type,
                }
                for chat in db_chat_history
            ]

        if doc_chat_history:
            chat_history["doc"] = [
                {
                    "uuid": chat.uuid,
                    "title": chat.title,
                    "query_type": chat.query_type,
                    "created_at": chat.created_at,
                    "doc_id": chat.id,
                    "doc_name": chat.document_name,
                }
                for chat in doc_chat_history
            ]

        if normal_chat_history:
            chat_history["chat"] = [
                {
                    "uuid": chat.uuid,
                    "title": chat.title,
                    "query_type": chat.query_type,
                    "created_at": chat.created_at,
                }
                for chat in normal_chat_history
            ]

        return chat_history

    @staticmethod
    def delete_chat_history_by_uuid(db: Session, chat_uuid: str):
        chat_history = (
            db.query(ChatHistory).filter(ChatHistory.uuid == chat_uuid).first()
        )
        if chat_history is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat history NOT found",
            )
        db.delete(chat_history)
        db.flush()

        # chat_store = RedisChatStore(redis_url=Config.REDIS_STORE_URL, ttl=300)
        chat_store = PostgreSQLChatStore(
            db_config={
                "dbname": Config.POSTGRES_DB,
                "user": Config.POSTGRES_USER,
                "password": Config.POSTGRES_PASSWORD,
                "host": Config.POSTGRES_HOSTNAME,
                "port": Config.POSTGRES_PORT,
            }
        )
        chat_memory_buffer = ChatMemoryBuffer.from_defaults(
            chat_store=chat_store, chat_store_key=str(chat_uuid), token_limit=5000
        )
        chat_memory_buffer.reset()

        return {"message": "Chat history deleted successfully"}
