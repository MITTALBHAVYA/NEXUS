from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.engine import reflection
from datetime import datetime
from openai import OpenAI
from config import Config
from logger import logger
import re
from helper.openai import openai_chat_completion_with_retry
from helper.postgres_chat_store import PostgreSQLChatStore
from helper.pipelines import post_processed_html_response
from helper.pipelines import get_llm_by_model
from llama_index.core.query_pipeline import QueryPipeline, InputComponent, FnComponent
from llama_index.core.prompts import PromptTemplate
from llama_index.storage.chat_store.redis import RedisChatStore
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage
from typing import Any, Dict, List, Optional
from llama_index.core.bridge.pydantic import Field
from llama_index.core.llms import ChatMessage
from llama_index.core.query_pipeline import CustomQueryComponent
from llama_index.llms.openai import OpenAI


class SQLResponseWithChatHistory(CustomQueryComponent):
    llm: Any = Field(..., description="LLM")
    system_prompt: Optional[str] = Field(
        default=None, description="System prompt to use for the LLM"
    )
    context_prompt: str = Field(
        description="Context prompt to use for the LLM",
    )

    def _validate_component_inputs(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """Validate component inputs during run_component."""
        # NOTE: this is OPTIONAL but we show you where to do validation as an example
        return input

    @property
    def _input_keys(self) -> set:
        """Input keys dict."""
        # NOTE: These are required inputs. If you have optional inputs please override
        # `optional_input_keys_dict`
        return {"chat_history", "query_str", "db_schema"}

    @property
    def _output_keys(self) -> set:
        return {"sql_query"}

    def _prepare_context(
        self,
        chat_history: List[ChatMessage],
        query_str: str,
        db_schema: str,
    ) -> List[ChatMessage]:

        formatted_context = self.context_prompt.format(
            query_str=query_str, db_schema=db_schema
        )
        user_message = ChatMessage(role="user", content=formatted_context)

        chat_history.append(user_message)

        if self.system_prompt is not None:
            chat_history = [
                ChatMessage(role="system", content=self.system_prompt)
            ] + chat_history

        return chat_history

    def _run_component(self, **kwargs) -> Dict[str, Any]:
        """Run the component."""
        chat_history = kwargs["chat_history"]
        query_str = kwargs["query_str"]
        db_schema = kwargs["db_schema"]

        prepared_context = self._prepare_context(chat_history, query_str, db_schema)

        response = self.llm.chat(prepared_context)

        return {"sql_query": response}

    async def _arun_component(self, **kwargs: Any) -> Dict[str, Any]:
        """Run the component asynchronously."""
        # NOTE: Optional, but async LLM calls are easy to implement
        chat_history = kwargs["chat_history"]
        query_str = kwargs["query_str"]
        db_schema = kwargs["db_schema"]

        prepared_context = self._prepare_context(chat_history, query_str, db_schema)

        response = await self.llm.achat(prepared_context)

        return {"sql_query": response}


def get_db_connection_string(
    db_type: str,
    db_user: str,
    db_password: str,
    db_host: str,
    db_port: int,
    db_name: str,
) -> str:
    """
    Get the database connection string.

    Args:
        db_type (str): The type of the database (e.g., "mysql", "postgres", "sqlite").
        db_user (str): The username for the database connection.
        db_password (str): The password for the database connection.
        db_host (str): The host address of the database server.
        db_port (int): The port number of the database server.
        db_name (str): The name of the database.

    Returns:
        str: The database connection string.

    Raises:
        ValueError: If an invalid database type is provided.
    """

    if db_type == "mysql":
        db_url = (
            f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        )
    elif db_type == "postgres":
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    elif db_type == "sqlite":
        db_url = f"sqlite:///{db_name}"
    else:
        raise ValueError("Invalid database type")

    return db_url


def get_db_schema(db_url: str) -> str:
    """
    Get the schema of the database.

    Args:
        db_url (str): The URL of the database.

    Returns:
        str: The schema of the database.

    """
    engine = create_engine(db_url)
    metadata = MetaData()
    metadata.reflect(bind=engine)

    inspector = reflection.Inspector.from_engine(engine)

    db_schema = ""
    for table_name, table in metadata.tables.items():
        db_schema += f"\n\nTable: {table_name}\n"
        db_schema += "-" * 30 + "\n"
        foreign_keys = inspector.get_foreign_keys(table_name)
        fk_dict = {fk["constrained_columns"][0]: fk for fk in foreign_keys}
        for column in table.columns:
            if column.name in fk_dict:
                fk = fk_dict[column.name]
                referenced_table = fk["referred_table"]
                referenced_column = fk["referred_columns"][0]
                db_schema += f"  {column.name} ({column.type}) [Foreign Key: {referenced_table}.{referenced_column}]\n"
            else:
                db_schema += f"  {column.name} ({column.type})\n"

    return db_schema


def run_sql_query(db_url: str, sql_query: ChatMessage) -> str:
    logger.debug(f"Executing SQL query: {sql_query}")
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text(sql_query))
        # check for empty result
        if result.rowcount == 0:
            query_result = "No results found"
        else:
            query_result = "\n".join([str(row) for row in result.fetchall()])

    return query_result


def extract_sql_query(sql_query: str) -> str:
    """
    Extracts the SQL query from the response generated by the OpenAI model.

    Args:
        sql_query (str): The response generated by the OpenAI model.

    Returns:
        str: The extracted SQL query.

    """
    sql_query = sql_query.message.content
    sql_query = re.search(r"```sql(.*)```", sql_query, re.DOTALL)
    if sql_query:
        return sql_query.group(1)

    sql_query = re.search(r"```(.*)```", sql_query, re.DOTALL)
    if sql_query:
        return sql_query.group(1)

    return sql_query


def db_config_pipeline(
    db_type: str,
    db_config: dict,
    query: str,
    chat_uuid: str,
    model: str = Config.DEFAULT_LLM_MODEL,
) -> str:
    """
    Executes a database query pipeline.

    Args:
        db_type (str): The type of the database.
        db_config (dict): The configuration details for the database.
        query (str): The query to be executed.
        model (str, optional): The OpenAI model to be used for query generation. Defaults to Config.DEFAULT_LLM_MODEL.

    Returns:
        tuple: A tuple containing the refined query result and the generated SQL query.

    """

    logger.debug(f"Using LLM : {model}")
    llm = get_llm_by_model(model=model)

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
    chat_memory = ChatMemoryBuffer.from_defaults(
        chat_store=chat_store, chat_store_key=chat_uuid, token_limit=5000
    )
    chat_history = chat_memory.get()
    logger.debug(f"Chat history: {chat_history}")

    input_component = InputComponent()
    db_schema_tool = FnComponent(fn=get_db_schema, output_key="db_schema")
    generate_sql = SQLResponseWithChatHistory(
        llm=llm,
        context_prompt="""
            The customer has requested the following query:
            {query_str}
            The database schema is as follows:
            {db_schema}
            Write a SQL query to extract the information from the database.
            SQL query:
            """,
        system_prompt=f"""
            You are a data analyst and database expert. You have been given a task to
            write a query to extract the information from the database. The time is now 
            {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}. You have to write sql query enclosed in triple backticks.
            """,
    )
    extract_sql_query_intermediate = FnComponent(
        fn=extract_sql_query, output_key="sql_query"
    )
    sql_result_tool = FnComponent(fn=run_sql_query, output_key="sql_result")
    refine_query_result_temp = (
        "You are a data analyst and database expert bot. You have been given a task to "
        "see the user query and query result and convert it into a more readable format. "
        "You don't need to mentioned that you are asked to refine the result. "
        "The customer has requested the following query:"
        "\n"
        "{query_str}"
        "\n"
        "The query result is as follows:"
        "\n"
        "{sql_result}"
        "\n"
        "Combine the result for more readability.  You should give HTML response (AVOID markdown) inside a <div> tag. Make sure to include any inline code within <b> tag and multiline code within <code> tag. You should only include code if explicitly requested by the user as user may not be familiar with code.\n"
        "\n"
        "response:"
    )
    refine_query_result_temp = PromptTemplate(refine_query_result_temp)

    p = QueryPipeline(verbose=True)
    p.add_modules(
        {
            "input_component": input_component,
            "db_schema_tool": db_schema_tool,
            "generate_sql": generate_sql,
            "extract_sql_query_intermediate": extract_sql_query_intermediate,
            "sql_result_tool": sql_result_tool,
            "refine_query_result_temp": refine_query_result_temp,
            "final_response": llm,
        }
    )
    p.add_link("input_component", "db_schema_tool", src_key="db_url", dest_key="db_url")
    p.add_link(
        "input_component", "generate_sql", src_key="query_str", dest_key="query_str"
    )
    p.add_link(
        "input_component",
        "generate_sql",
        src_key="chat_history",
        dest_key="chat_history",
    )
    p.add_link(
        "input_component", "sql_result_tool", src_key="db_url", dest_key="db_url"
    )
    p.add_link(
        "input_component",
        "refine_query_result_temp",
        src_key="query_str",
        dest_key="query_str",
    )
    p.add_link(
        "db_schema_tool", "generate_sql", src_key="db_schema", dest_key="db_schema"
    )
    p.add_link(
        "generate_sql",
        "extract_sql_query_intermediate",
        src_key="sql_query",
        dest_key="sql_query",
    )
    p.add_link(
        "extract_sql_query_intermediate",
        "sql_result_tool",
        src_key="sql_query",
        dest_key="sql_query",
    )
    p.add_link(
        "sql_result_tool",
        "refine_query_result_temp",
        src_key="sql_result",
        dest_key="sql_result",
    )
    p.add_link(
        "refine_query_result_temp",
        "final_response",
    )

    logger.debug("Fetching database schema")

    db_url = get_db_connection_string(
        db_type=db_type,
        db_user=db_config["user"],
        db_password=db_config["password"],
        db_host=db_config["hostname"],
        db_port=db_config["port"],
        db_name=db_config["dbname"],
    )

    logger.debug(f"Database URL: {db_url}")
    result, intermediates = p.run_with_intermediates(
        db_url=db_url,
        query_str=query,
        chat_history=chat_history,
    )
    # logger.debug(f"Pipeline result: {result}")
    # logger.debug(f"Pipeline intermediates: {intermediates}")

    refined_query_result = result.message.content
    sql_query = intermediates["extract_sql_query_intermediate"].outputs["sql_query"]

    logger.debug(f"Refined query result: {refined_query_result}")
    logger.debug(f"Generated SQL query: {sql_query}")

    # update the memory
    user_msg = ChatMessage(role="user", content=query)
    chat_memory.put(user_msg)
    chat_memory.put(result.message)

    return post_processed_html_response(refined_query_result), sql_query
