import pandas as pd
from typing import Any, Dict, List, Optional

from llama_index.core.query_pipeline import (
    QueryPipeline,
    InputComponent,
    FunctionComponent,
)
from helper.postgres_chat_store import PostgreSQLChatStore
from llama_index.storage.chat_store.redis import RedisChatStore
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.llms import ChatMessage
from llama_index.llms.openai import OpenAI
import json
import pandas as pd
import random, os
from datetime import datetime
from helper.pipelines.chart_helper.components import (
    ChartTypeSelector,
    ChartDataGeneratorViaPython,
    ChartDataCodeExecutor,
    CaptionGenerator,
    chart_data_schema_tool,
    chart_validator_tool,
)
from db.queries.user_documents import UserDocumentQuery
from db.queries.db_config import DBConfigQuery
from db.queries.chart import ChartQuery
from db import get_db
from helper.aws_s3 import download_from_s3
from helper.pipelines.chart_helper import extract_backticks_content
from helper.pipelines.excel_query import get_excel_schema
from helper.pipelines.db_query import get_db_connection_string, get_db_schema
from helper.pipelines import get_llm_by_model
from config import Config
from logger import logger
from sqlalchemy import create_engine


def chart_query_pipeline(
    query_str: str,
    chat_uuid: str,
    query_type: str,
    data_source_id: int,
    model: str = Config.DEFAULT_LLM_MODEL,
) -> Dict[str, Any]:
    """
    Query pipeline for chart queries
    """

    if query_type not in ["csv", "excel", "db"]:
        raise ValueError("Invalid query type")

    db = next(get_db())
    if query_type in ["csv", "excel"]:
        user_doc = UserDocumentQuery.get_user_document_by_id(db, data_source_id)
        if not user_doc:
            raise ValueError("Invalid data source id")

        file_s3_url = user_doc.document_url
        object_url = file_s3_url.split("amazonaws.com/")[-1]
        file_extension = object_url.split(".")[-1]
        file_name = random.randbytes(10).hex() + "." + file_extension
        temp_file_path = f"/tmp/{file_name}"

        if not download_from_s3(object_url, temp_file_path):
            raise Exception("Failed to download the file from s3")

        if file_extension == "csv":
            df = pd.read_csv(temp_file_path)
        else:
            df = pd.read_excel(temp_file_path, sheet_name=None)
    else:
        db_instance = DBConfigQuery.get_db_config_by_id(db, data_source_id)
        db_url = get_db_connection_string(
            db_type=db_instance.db_type,
            db_user=db_instance.db_config["user"],
            db_password=db_instance.db_config["password"],
            db_host=db_instance.db_config["hostname"],
            db_port=db_instance.db_config["port"],
            db_name=db_instance.db_config["dbname"],
        )
        data_schema = get_db_schema(db_url=db_url)
        user_db_conn = create_engine(db_url)

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

    logger.debug(f"Using LLM : {model}")
    llm = get_llm_by_model(model=model)

    input_component = InputComponent()
    chart_type_selector_component = ChartTypeSelector(
        llm=llm,
        context_prompt=(
            "Data Schema:\n"
            "{data_schema}\n"
            "User Query:\n"
            "{query_str}\n"
            "Response:\n"
        ),
        system_prompt=(
            "1. Your task is to analyze user query and given data schema.\n"
            "2. You need to pick the best chart type which can be used for the given user query.\n"
            "3. Only following chart types are allowed: 'area', 'bar', 'line', 'pie', 'radar'.\n"
            "4. You must output a JSON with a key 'chart_type' with the value of best chart which fits on the user query."
            '5. Makes sure to have the following output schema: {"chart_type":"<The best chart type which fits on the user query>"}\n'
            "6. You should enclose JSON within 3 backticks.\n"
            f"7. The current timestamp is {datetime.utcnow()}.\n"
        ),
    )
    chart_data_schema_tool_component = FunctionComponent(
        fn=chart_data_schema_tool, output_key="chart_schema"
    )
    if query_type in ["csv", "excel"]:
        extra_excel_instructions = (
            "Always use the sheet name to access individual sheet data, for example, `df['Sheet1']`. It is already loaded using `df = pd.read_excel(temp_file_path, sheet_name=None)`"
            if query_type == "excel"
            else ""
        )
        chart_data_generator_component = ChartDataGeneratorViaPython(
            llm=llm,
            context_prompt=(
                "INSTRUCTIONS:\n"
                "- You are an expert developer in Python and data science.\n"
                "- Your task is to convert the user query into Python code that generates a data structure following the schema below. This code will be executed using the `exec()` function.\n"
                "List Schema of `chart_data` variable:"
                "{chart_schema}\n"
                "1. Each element of the list should be a dictionary.\n"
                "2. Each dictionary should have a key named 'label' with a string value according to the X-axis of the chart.\n"
                "3. Each dictionary should include other keys representing metric names with their decimal values.\n"
                "4. The size of the list should not exceed 7 elements unless explicitly mentioned in the user query.\n"
                """Example: [{"label": "Jan", "sales": 100, "profit": 20}, {"label": "Feb", "sales": 120, "profit": 25}]\n"""
                "- The generated code must be executable using Python's built-in `exec()` function\n"
                "- Do not use `print` statements or the `matplotlib`/`seaborn` modules.\n"
                "- Store the final chart data in the `chart_data` variable to capture it after the `exec()` call.\n"
                "- You are only allowed to use the 'pandas' library, and the dataframe named `df` is already loaded. `df` Context will be provided later through `exec()`. \n"
                "- "
                "- Output the Python code enclosed in triple backticks (```).\n"
                f"{extra_excel_instructions}\n\n"
                "Details:\n"
                f"- Current timestamp: {datetime.utcnow()}\n"
                "- User Query: \n"
                "{query_str}\n"
                "- Dataframe Schema: \n"
                "{data_schema}\n"
                "- Chart Type: {chart_type}\n\n"
                "Python code:\n"
            ),
            system_prompt=None,
        )
    else:
        chart_data_generator_component = ChartDataGeneratorViaPython(
            llm=llm,
            context_prompt=(
                "INSTRUCTIONS:\n"
                "- You are a expert developer in python and data science\n"
                "- Your task to convert the user query into the schema below:- \n"
                "List Schema of `chart_data` variable: \n"
                "{chart_schema}\n"
                "1. Each element of the list should be a dictionary.\n"
                "2. Each dictionary should have a key `label`  and its value should be a string. It should be named according to the X-axis of the chart.\n"
                "3. Each and every other key should be the name of the metric and its decimal value.\n"
                "4. The size of the list should not exceed 7 elements unless explicitly mentioned in the user query.\n"
                "- The code should be generated in such a way it can executed using python's in-built `exec()` function.\n"
                "- You should not use print statement or matplotlib/seaborne module.\n"
                "- You should store the final chart data into `chart_data` variable so that it can be captured after `exec()` call.\n"
                "- You are allowed to use pandas and name of the sqlalchemy connection is `conn`. Its context will be provided later through `exec()`. \n"
                "- You should output the Python code enclosed in 3 backticks.\n"
                f"- The current timestamp is {datetime.utcnow()}.\n"
                "User Query: \n"
                "{query_str}\n"
                "Database Schema: \n"
                "{data_schema}\n"
                "Chart Type: {chart_type}\n"
                "Python code:\n"
            ),
            system_prompt=None,
        )

    if query_type in ["csv", "excel"]:
        chart_data_code_executor_component = ChartDataCodeExecutor(df=df)
    else:
        chart_data_code_executor_component = ChartDataCodeExecutor(conn=user_db_conn)
    chart_validator_tool_component = FunctionComponent(
        fn=chart_validator_tool, output_key="validated_chart_data"
    )
    caption_generator_component = CaptionGenerator(
        llm=llm,
        context_prompt=(
            "1. You are very good writer and response synthesier.\n"
            "2. Your task is to generate caption for the charts requested by the user.\n"
            "3. You will be given user query and you need to generate the caption for the same.\n"
            "4. Assume that the appropiate chart has already been generated for the user."
            "5. You should output a JSON enclosed with 3 backticks with a key 'caption'."
            f"6. The current timestamp is {datetime.utcnow()}.\n"
            "User Query:\n"
            "{query_str}\n"
            "Caption: \n"
        ),
        system_prompt=None,
    )

    p = QueryPipeline(verbose=True)

    p.add_modules(
        {
            "input_component": input_component,
            "chart_type_selector_component": chart_type_selector_component,
            "chart_data_schema_tool_component": chart_data_schema_tool_component,
            "chart_data_generator_component": chart_data_generator_component,
            "chart_data_code_executor_component": chart_data_code_executor_component,
            "chart_validator_tool_component": chart_validator_tool_component,
            "caption_generator_component": caption_generator_component,
        }
    )

    p.add_link(
        "input_component",
        "chart_type_selector_component",
        src_key="query_str",
        dest_key="query_str",
    )
    p.add_link(
        "input_component",
        "chart_type_selector_component",
        src_key="chat_history",
        dest_key="chat_history",
    )
    p.add_link(
        "input_component",
        "chart_type_selector_component",
        src_key="data_schema",
        dest_key="data_schema",
    )

    p.add_link(
        "chart_type_selector_component",
        "chart_data_schema_tool_component",
        src_key="chart_type",
        dest_key="chart_type",
    )

    p.add_link(
        "input_component",
        "chart_data_generator_component",
        src_key="query_str",
        dest_key="query_str",
    )
    p.add_link(
        "input_component",
        "chart_data_generator_component",
        src_key="chat_history",
        dest_key="chat_history",
    )
    p.add_link(
        "input_component",
        "chart_data_generator_component",
        src_key="data_schema",
        dest_key="data_schema",
    )
    p.add_link(
        "chart_type_selector_component",
        "chart_data_generator_component",
        src_key="chart_type",
        dest_key="chart_type",
    )
    p.add_link(
        "chart_data_schema_tool_component",
        "chart_data_generator_component",
        src_key="chart_schema",
        dest_key="chart_schema",
    )

    p.add_link(
        "chart_data_generator_component",
        "chart_data_code_executor_component",
        src_key="python_code",
        dest_key="python_code",
    )

    p.add_link(
        "chart_type_selector_component",
        "chart_validator_tool_component",
        src_key="chart_type",
        dest_key="chart_type",
    )
    p.add_link(
        "chart_data_code_executor_component",
        "chart_validator_tool_component",
        src_key="chart_data",
        dest_key="chart_data",
    )

    p.add_link(
        "input_component",
        "caption_generator_component",
        src_key="query_str",
        dest_key="query_str",
    )
    p.add_link(
        "input_component",
        "caption_generator_component",
        src_key="chat_history",
        dest_key="chat_history",
    )
    p.add_link(
        "chart_validator_tool_component",
        "caption_generator_component",
        src_key="validated_chart_data",
        dest_key="validated_chart_data",
    )

    if query_type == "csv":
        result, intermediates = p.run_with_intermediates(
            query_str=query_str, chat_history=chat_history, data_schema=f"{df.head()}"
        )
    elif query_type == "excel":
        result, intermediates = p.run_with_intermediates(
            query_str=query_str,
            chat_history=chat_history,
            data_schema=get_excel_schema(temp_file_path),
        )
    else:
        result, intermediates = p.run_with_intermediates(
            query_str=query_str,
            chat_history=chat_history,
            data_schema=data_schema,
            conn=user_db_conn,
        )

    if query_type in ["csv", "excel"]:
        os.remove(temp_file_path)

    chart_type_info = intermediates["chart_type_selector_component"].outputs[
        "chart_type"
    ]

    python_code = extract_backticks_content(
        intermediates["chart_data_generator_component"].outputs["python_code"], "python"
    )

    chart_data = intermediates["chart_validator_tool_component"].outputs[
        "validated_chart_data"
    ]
    caption_info = json.loads(
        extract_backticks_content(
            intermediates["caption_generator_component"].outputs["caption"], "json"
        )
    )
    logger.debug(f"Chart Type: {chart_type_info}")
    logger.debug(f"Python Code: {python_code}")
    logger.debug(f"Chart Data: {chart_data}")
    logger.debug(f"Caption: {caption_info}")
    # save the chart
    chart = ChartQuery.create_chart(
        db,
        chat_uuid=chat_uuid,
        chart_type=chart_type_info,
        code=python_code,
        data=chart_data,
        caption=caption_info["caption"],
    )
    db.commit()

    # update the memory
    chat_memory.put(ChatMessage(role="user", content=query_str))
    response_message = ChatMessage(
        role="assistant",
        content=result.message.content,
        additional_kwargs={
            "chart_uuid": str(chart.uuid),
            "chart_type": chart.chart_type,
            "chart_data": chart.data,
        },
    )
    chat_memory.put(response_message)

    return {
        "chart_uuid": str(chart.uuid),
    }
