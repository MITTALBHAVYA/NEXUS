from db import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, UUID
from datetime import datetime
from uuid import uuid4


class ChatHistory(Base):

    __tablename__ = "chat_history"

    uuid = Column(UUID(as_uuid=True), unique=True, default=uuid4, nullable=False, primary_key=True)
    customer_uuid = Column(UUID(as_uuid=True), ForeignKey(
        'customers.uuid'), nullable=False)
    query_type = Column(String, nullable=False)
    data_source_id = Column(Integer)
    title = Column(String)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
