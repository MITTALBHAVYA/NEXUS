from llama_index.storage.chat_store.redis import RedisChatStore
from helper.postgres_chat_store import PostgreSQLChatStore
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.llms import ChatMessage
from llama_index.llms.openai import OpenAI
import json
from helper.pipelines.chart_helper import extract_backticks_content
from config import Config
from logger import logger


def is_chart_related_query(query_str: str, chat_uuid: str) -> bool:
    """
    Check if the query is a chart related query

    Args:
        query_str (str): The query string
        chat_uuid (str): The chat UUID

    Returns:
        bool: True if the query is a chart related query, False otherwise
    """

    llm = OpenAI(model=Config.DEFAULT_LLM_MODEL)

    # chat_store = RedisChatStore(Config.REDIS_STORE_URL)
    chat_store = PostgreSQLChatStore(
        db_config={
            "dbname": Config.POSTGRES_DB,
            "user": Config.POSTGRES_USER,
            "password": Config.POSTGRES_PASSWORD,
            "host": Config.POSTGRES_HOSTNAME,
            "port": Config.POSTGRES_PORT,
        }
    )
    chat_memory = ChatMemoryBuffer.from_defaults(
        chat_store=chat_store, chat_store_key=chat_uuid, token_limit=5000
    )

    chat_history = chat_memory.get()

    prompt = (
        "1. You are expert in analyzing user query and identifying if it requires generating a chart.\n"
        "2. You will be provided with a user query along with the chat history.\n"
        "3. You have to identify if the user wants to generate chart or plots.\n"
        "4. You should output 'false' if he user query is referencing previous charts and does not require generating a new chart.\n"
        "5. You should output JSON with a key 'is_chart_related' and a boolean value.\n"
        "6. The JSON should be enclosed in 3 backticks. \n"
        "Example:\n"
        """User Query: What are the sales of the products in the last 3 months?\nResponse: {"is_chart_related": false}\n"""
        """User Query: What are top 5 genres?\nResponse: {"is_chart_related": false}\n"""
        """User Query: what is the distribution of employees by gender?\nResponse: {"is_chart_related": false}\n"""
        """User Query: Plot customer distribution by gender. \nResponse: {"is_chart_related": true}\n"""
        """"User Query: Show me the sales trend for the last 6 months in bar chart. \nResponse: {"is_chart_related": true}\n"""
        "User Query:\n"
        f"{query_str}\n"
        "Response: \n"
    )

    chat_history.append(ChatMessage(role="user", content=prompt))
    response = llm.chat(chat_history)

    response = extract_backticks_content(response, "json")
    logger.debug(f"Check chart related query response: {response}")
    response = json.loads(response)

    is_chart_related = response.get("is_chart_related", False)

    return is_chart_related
