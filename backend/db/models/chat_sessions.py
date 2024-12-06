from sqlalchemy import Column, Integer, String, JSON, TIMESTAMP
from datetime import datetime
from db import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    chat_session_id = Column(Integer, primary_key=True)
    session_key = Column(String(255), nullable=False, index=True)
    message = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
