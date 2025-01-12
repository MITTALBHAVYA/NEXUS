import psycopg2
from llama_index.core.bridge.pydantic import Field
from llama_index.core.llms import ChatMessage
from llama_index.core.storage.chat_store.base import BaseChatStore
from typing import Optional, Any, List
import json
from datetime import datetime


class PostgreSQLChatStore(BaseChatStore):
    """
    A class that represents a PostgreSQL chat store.
    Please note a table named `chat_sessions` should be created in the database
    with the following mandatory schema:

    ```sql
    CREATE TABLE chat_sessions (
    chat_session_id SERIAL PRIMARY KEY,
    session_key VARCHAR(255) NOT NULL,
    message JSONB NOT NULL
    );
    ```

    Attributes:
    -   `conn`: The connection to the PostgreSQL database.
    -   `cursor`: The cursor object to execute SQL queries.
    """

    db_config: dict = Field(description="Database configuration parameters.")
    conn: Optional[Any] = Field(description="Connection to the PostgreSQL database.")
    cursor: Optional[Any] = Field(description="Cursor object to execute SQL queries.")

    def __init__(self, db_config: dict, **kwargs) -> None:
        """
        Initializes a PostgreSQLChatStore object.

        Args:
            db_config: A dictionary containing the database configuration parameters.
            Example:
            {
                'dbname': 'your_db',
                'user': 'your_user',
                'password': 'your_password',
                'host': 'your_host',
                'port': 'your_port'
            }
        """
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        super().__init__(db_config=db_config, conn=conn, cursor=cursor)

    @classmethod
    def class_name(cls) -> str:
        """Get class name."""
        return "PostgreSQLChatStore"

    def set_messages(self, key: str, messages: List[ChatMessage]) -> None:
        """
        Sets the messages for a given key in the chat store.

        Args:
            key: The key to identify the chat session.
            messages: A list of ChatMessage objects representing the messages.

        Returns:
            None
        """
        # check if the key already exists
        self.cursor.execute(
            "SELECT * FROM chat_sessions WHERE session_key = %s", (key,)
        )
        rows = self.cursor.fetchall()
        if rows:
            # update the existing key
            json_messages = json.dumps(
                [self.__chat_message_to_dict(message) for message in messages]
            )
            updated_at = datetime.utcnow()
            self.cursor.execute(
                "UPDATE chat_sessions SET message = %s, updated_at = %s WHERE session_key = %s",
                (json_messages, updated_at, key),
            )
            self.conn.commit()

        else:
            # insert a new key
            self.cursor.execute(
                "DELETE FROM chat_sessions WHERE session_key = %s", (key,)
            )
            json_messages = json.dumps(
                [self.__chat_message_to_dict(message) for message in messages]
            )
            created_at = datetime.utcnow()
            self.cursor.execute(
                "INSERT INTO chat_sessions (session_key, message, created_at, updated_at) VALUES (%s, %s, %s, %s)",
                (key, json_messages, created_at, created_at),
            )
            self.conn.commit()

    def get_messages(self, key: str) -> List[ChatMessage]:
        """
        Retrieves the messages for a given key from the chat store.

        Args:
            key: The key to identify the chat session.

        Returns:
            A list of ChatMessage objects representing the messages.
        """
        self.cursor.execute(
            "SELECT message FROM chat_sessions WHERE session_key = %s", (key,)
        )
        rows = self.cursor.fetchall()
        messages = rows[0][0] if rows else []
        return [self.__dict_to_chat_message(message) for message in messages]

    def add_message(
        self, key: str, message: ChatMessage, idx: Optional[int] = None
    ) -> None:
        """
        Adds a message to the chat store for a given key.

        Args:
            key: The key to identify the chat session.
            message: The ChatMessage object representing the message.
            idx: The index at which the message should be added. If None, the message is appended to the end.

        Returns:
            None
        """
        if idx is None:
            messages = self.get_messages(key)
            messages.append(message)
            self.set_messages(key, messages)
        else:
            messages = self.get_messages(key)
            messages.insert(idx, message)
            self.set_messages(key, messages)

    def delete_messages(self, key: str) -> Optional[List[ChatMessage]]:
        """
        Deletes all messages for a given key from the chat store.

        Args:
            key: The key to identify the chat session.

        Returns:
            An optional list of ChatMessage objects representing the deleted messages.
            Returns None if no messages were deleted.
        """
        messages = self.get_messages(key)
        self.cursor.execute("DELETE FROM chat_sessions WHERE session_key = %s", (key,))
        self.conn.commit()
        return messages

    def delete_message(self, key: str, idx: int) -> Optional[ChatMessage]:
        """
        Deletes a specific message at the given index for a given key from the chat store.

        Args:
            key: The key to identify the chat session.
            idx: The index of the message to delete.

        Returns:
            An optional ChatMessage object representing the deleted message.
            Returns None if the index is out of range.
        """
        messages = self.get_messages(key)
        if idx < len(messages):
            message = messages.pop(idx)
            self.set_messages(key, messages)
            return message
        return None

    def delete_last_message(self, key: str) -> Optional[ChatMessage]:
        """
        Deletes the last message for a given key from the chat store.

        Args:
            key: The key to identify the chat session.

        Returns:
            An optional ChatMessage object representing the deleted message.
            Returns None if there are no messages.
        """
        messages = self.get_messages(key)
        if messages:
            message = messages.pop()
            self.set_messages(key, messages)
            return message
        return None

    def get_keys(self) -> List[str]:
        """
        Retrieves all the unique session keys from the chat store.

        Returns:
            A list of strings representing the session keys.
        """
        self.cursor.execute("SELECT DISTINCT session_key FROM chat_sessions")
        rows = self.cursor.fetchall()
        return [row[0] for row in rows]

    def __chat_message_to_dict(self, chat_message: ChatMessage) -> str:
        """
        Converts a ChatMessage object to a JSON string.

        Args:
            chat_message: The ChatMessage object to be converted.

        Returns:
            A JSON string representing the ChatMessage object.
        """
        return {
            "role": chat_message.role,
            "content": chat_message.content,
            "extras": chat_message.additional_kwargs or {},
        }

    def __dict_to_chat_message(self, message_dict: dict) -> ChatMessage:
        """
        Converts a dictionary to a ChatMessage object.
        Args:
            message_dict: The dictionary to be converted.
        Returns:
            A ChatMessage object representing the dictionary.
        """
        return ChatMessage(
            role=message_dict["role"],
            content=message_dict["content"],
            additional_kwargs=message_dict.get("extras"),
        )

# Example usage
# db_config = {
#     "dbname": "your_db",
#     "user": "your_user",
#     "password": "your_password",
#     "host": "your_host",
#     "port": "your_port",
# }

# chat_store = PostgreSQLChatStore(db_config)
