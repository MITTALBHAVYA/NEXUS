from dotenv import load_dotenv
import os
from datetime import timedelta
from functools import lru_cache

load_dotenv()


class Config:

    # PROJECT
    PROJECT_NAME = "Analytics Agent"
    PROJECT_VERSION = "1.0"

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("JWT_REFRESH_TOKEN_EXPIRE_MINUTES")
    )

    # OPENAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    DEFAULT_LLM_MODEL = os.getenv("DEFAULT_LLM_MODEL")
    DEFAULT_EMBEDDING_MODEL = os.getenv("DEFAULT_EMBEDDING_MODEL")
    # Gemini
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    # Anthropic
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

    # GOOGLE OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

    # CHROMA
    CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH")

    # REDIS
    REDIS_STORE_URL = os.getenv("REDIS_STORE_URL")

    # AWS Bucket
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
    AWS_REGION_NAME = os.getenv("AWS_REGION_NAME")

    # Postgres
    POSTGRES_USER = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_DB = os.getenv("POSTGRES_DB")
    POSTGRES_HOSTNAME = os.getenv("POSTGRES_HOSTNAME")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT")

    # DB
    SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOSTNAME}:{POSTGRES_PORT}/{POSTGRES_DB}"


@lru_cache()
def get_settings():
    """
    Returns a cached instance of the Config class.
    This function is used to access application settings across the application.
    The lru_cache decorator ensures that the function is only called once,
    and subsequent calls return the cached result.
    """
    return Config()
