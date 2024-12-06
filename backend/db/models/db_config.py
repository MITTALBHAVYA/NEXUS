from db import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, UUID, JSON
from datetime import datetime
from uuid import uuid4


class DBConfig(Base):
    """
    Represents a database configuration.

    Attributes:
        id (int): The unique identifier of the database configuration.
        customer_uuid (UUID): The UUID of the customer associated with the database configuration.
        db_type (str): The type of the database.
        db_config (JSON): The configuration details of the database.
        created_at (datetime): The timestamp when the database configuration was created.
        updated_at (datetime): The timestamp when the database configuration was last updated.
    """

    __tablename__ = 'db_configs'

    id = Column(Integer, primary_key=True, index=True)
    customer_uuid = Column(UUID(as_uuid=True), ForeignKey(
        'customers.uuid'), nullable=False)
    db_type = Column(String, nullable=False)
    db_config = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """
        Converts the DBConfig object to a dictionary.

        Returns:
            dict: A dictionary representation of the DBConfig object.
        """
        return {
            "id": self.id,
            "db_type": self.db_type,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }