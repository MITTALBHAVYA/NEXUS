from db import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, UUID, LargeBinary, Boolean
from datetime import datetime
from uuid import uuid4


class Customer(Base):
    """
    Represents a customer in the system.

    Attributes:
        id (int): The unique identifier for the customer.
        uuid (UUID): The universally unique identifier for the customer.
        name (str): The name of the customer.
        email (str): The email address of the customer.
        password (bytes): The password of the customer.
        is_google_user (bool): Flag indicating if the user authenticated via Google.
        last_login (datetime): The timestamp of the customer's last login.
        created_at (datetime): The timestamp of when the customer was created.
        updated_at (datetime): The timestamp of when the customer was last updated.
    """

    __tablename__ = 'customers'

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True,
                  default=uuid4, nullable=False)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(LargeBinary, nullable=False)
    is_google_user = Column(Boolean, default=False, nullable=False)
    last_login = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            "uuid": str(self.uuid),
            "name": self.name,
            "email": self.email,
            "is_google_user": self.is_google_user,
            "last_login": self.last_login,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
