from llama_index.embeddings.openai import OpenAIEmbedding
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, StorageContext, SimpleDirectoryReader
from config import Config
from fastapi import HTTPException, status
from logger import logger
from openai import OpenAI
import time
from fastapi import HTTPException, status


def create_document_embedding(
    document_path: str,
    customer_uuid: str,
) -> str:
    """
    Create a document embedding for the given document path and customer UUID.

    Args:
        document_path (str): The path of the document to create the embedding for.
        customer_uuid (str): The UUID of the customer.

    Returns:
        str: The name of the chroma collection where the document embedding is stored.
    """

    try:
        openai_embedding = OpenAIEmbedding(model=Config.DEFAULT_OPENAI_EMBEDDING_MODEL)
        doc = SimpleDirectoryReader(
            input_files=[document_path],
        ).load_data()

        db = chromadb.PersistentClient(path=Config.CHROMA_DB_PATH)
        filename = document_path.split("/")[-1]
        chroma_collection_name = f"{customer_uuid}_{filename}"

        chroma_collection = db.get_or_create_collection(chroma_collection_name)
        vector_store = ChromaVectorStore(
            chroma_collection=chroma_collection,
        )
        storage_context = StorageContext.from_defaults(
            vector_store=vector_store,
        )

        index = VectorStoreIndex.from_documents(
            doc,
            storage_context=storage_context,
            embed_model=openai_embedding,
        )
    except Exception as e:
        logger.error(f"Failed to create document embedding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create document embedding",
        )

    return chroma_collection_name


def openai_chat_completion_with_retry(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.0,
    top_p: float = 0.2,
    model: str = Config.DEFAULT_LLM_MODEL,
    max_retries: int = 3,
    retry_interval: int = 5,
) -> str:
    """
    Perform an OpenAI chat completion with retries.

    Args:
        model (str): The OpenAI model to use for chat completions.
        system_prompt (str): The system prompt for the chat completion.
        user_prompt (str): The user prompt for the chat completion.
        max_retries (int): The maximum number of retries (default: 3).
        retry_interval (int): The interval between retries in seconds (default: 5).

    Returns:
        str: The chat completion response.
    """

    openai_client = OpenAI(api_key=Config.OPENAI_API_KEY)
    retries = 0

    while retries < max_retries:
        try:
            response = openai_client.chat.completions.create(
                model=model,
                temperature=temperature,
                top_p=top_p,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )

            response_text = response.choices[0].message.content
            logger.debug(f"OpenAI response: {response_text}")

            return response_text
        except Exception as e:
            logger.error(f"Failed to perform OpenAI chat completion: {e}")
            retries += 1
            logger.info(f"Retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)
            retry_interval += (
                5  # increase the retry interval by 5 seconds for each retry
            )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Some internal error occurred (Error Code: MAX_RETRIES_EXCEEDED)",
    )
