from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex
from config import Config
from fastapi import HTTPException, status
from logger import logger
from helper.postgres_chat_store import PostgreSQLChatStore
from helper.pipelines import post_processed_html_response
from helper.pipelines import get_llm_by_model
import pandas as pd
from llama_index.core.query_pipeline import (
    QueryPipeline as QP,
    Link,
    InputComponent,
)
from llama_index.experimental.query_engine.pandas import PandasInstructionParser
from llama_index.core import PromptTemplate
from datetime import datetime
import time
from llama_index.storage.chat_store.redis import RedisChatStore
from llama_index.core.memory import ChatMemoryBuffer
from typing import Any, Dict, List, Optional
from llama_index.core.bridge.pydantic import Field
from llama_index.core.llms import ChatMessage
from llama_index.core.query_pipeline import CustomQueryComponent


class PandasResponseWithChatHistory(CustomQueryComponent):
    llm: Any = Field(..., description="LLM")
    system_prompt: Optional[str] = Field(
        default=None, description="System prompt to use for the LLM"
    )
    context_prompt: Optional[str] = Field(
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
        return {"chat_history", "query_str"}

    @property
    def _output_keys(self) -> set:
        return {"response"}

    def _prepare_context(
        self,
        chat_history: List[ChatMessage],
        query_str: str,
    ) -> List[ChatMessage]:

        formatted_context = query_str
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

        prepared_context = self._prepare_context(chat_history, query_str)

        response = self.llm.chat(prepared_context)

        return {"response": response}

    async def _arun_component(self, **kwargs: Any) -> Dict[str, Any]:
        """Run the component asynchronously."""
        # NOTE: Optional, but async LLM calls are easy to implement
        chat_history = kwargs["chat_history"]
        query_str = kwargs["query_str"]

        prepared_context = self._prepare_context(chat_history, query_str)

        response = await self.llm.achat(prepared_context)

        return {"response": response}


def get_excel_schema(excel_path: str) -> str:
    # get the head of each sheet present in the excel file and combine it
    # beautifully to form a schema
    df = pd.read_excel(excel_path, sheet_name=None)
    schema = ""
    for sheet in df:
        schema += f"Sheet Name: '{sheet}'\n"
        schema += "-" * 50 + "\n"
        schema += f"{df[sheet].head()}\n\n"

    return schema


def excel_pipeline(
    excel_path: str,
    customer_query: str,
    chat_uuid: str,
    model: str = Config.DEFAULT_LLM_MODEL,
):

    logger.debug(f"Querying Excel file: {excel_path}")
    df = pd.read_excel(excel_path, sheet_name=None)

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

    instruction_str = (
        "1. Convert the query to executable Python code using Pandas.\n"
        "2. The final line of code should be a Python expression that can be called with the `eval()` function.\n"
        "3. The code should represent a solution to the query.\n"
        "4. PRINT ONLY THE EXPRESSION.\n"
        "5. Do not quote the expression.\n"
        f"6. The current timestamp is {datetime.utcnow()}.\n"
        "7. Always use the sheet name to access the dataframe. For example, `df['Sheet1']`.\n"
    )

    pandas_prompt_str = (
        "You are working with a excel pandas dataframe in Python.\n"
        "The name of the dataframe is `df`.\n"
        "The dataframe `df` is loaded using `df = pd.read_excel(excel_path, sheet_name=None)`.\n"
        "Below is the schema of the excel file for each sheet present in it:\n"
        "{excel_schema}\n\n"
        "Follow these instructions:\n"
        "{instruction_str}\n"
        "Query: {query_str}\n\n"
        "Expression:"
    )
    response_synthesis_prompt_str = (
        "Given an input question, synthesize a response from the query results.\n"
        "Query: {query_str}\n\n"
        "Pandas Instructions (optional):\n{pandas_instructions}\n\n"
        "Pandas Output: {pandas_output}\n\n"
        " You should give HTML response (AVOID markdown) inside a <div> tag. Make sure to include any inline code within <b> tag and multiline code within <code> tag. You should only include code if explicitly requested by the user as user may not be familiar with code.\n"
        "Response: "
    )

    pandas_prompt = PromptTemplate(pandas_prompt_str).partial_format(
        instruction_str=instruction_str, excel_schema=get_excel_schema(excel_path)
    )
    pandas_output_parser = PandasInstructionParser(df)
    response_synthesis_prompt = PromptTemplate(response_synthesis_prompt_str)
    
    logger.debug(f"Using LLM : {model}")
    llm = get_llm_by_model(model=model)

    pandas_response = PandasResponseWithChatHistory(llm=llm)
    qp = QP(
        modules={
            "input": InputComponent(),
            "pandas_prompt": pandas_prompt,
            "pandas_response": pandas_response,
            "pandas_output_parser": pandas_output_parser,
            "response_synthesis_prompt": response_synthesis_prompt,
            "llm2": llm,
        },
        verbose=True,
    )

    qp.add_link("input", "pandas_prompt", src_key="query_str", dest_key="query_str")
    qp.add_link(
        "input", "pandas_response", src_key="chat_history", dest_key="chat_history"
    )
    qp.add_link("pandas_prompt", "pandas_response", dest_key="query_str")
    qp.add_link("pandas_response", "pandas_output_parser")
    qp.add_link(
        "pandas_output_parser", "response_synthesis_prompt", dest_key="pandas_output"
    )
    qp.add_link(
        "pandas_response", "response_synthesis_prompt", dest_key="pandas_instructions"
    )
    qp.add_link(
        "input", "response_synthesis_prompt", src_key="query_str", dest_key="query_str"
    )
    qp.add_link(
        "response_synthesis_prompt",
        "llm2",
    )

    logger.debug("Running the Query Pipeline...")
    max_retry = 3
    while max_retry > 0:
        try:
            result = qp.run(
                query_str=customer_query,
                chat_history=chat_history,
            )
            response = result.message.content
            logger.debug(f"Query Pipeline response: {response}")
            # update chat memory
            chat_memory.put(ChatMessage(role="user", content=customer_query))
            chat_memory.put(result.message)
            return post_processed_html_response(response)
        except Exception as e:
            logger.error(f"Failed to run query pipeline: {e}")
            logger.info("Retrying in 5 seconds...")
            time.sleep(5)
            max_retry -= 1

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to run query pipeline",
    )
