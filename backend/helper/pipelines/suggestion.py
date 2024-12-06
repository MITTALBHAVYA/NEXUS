from fastapi import HTTPException, status
from openai import OpenAI
from config import Config
from logger import logger
from schemas.ai_suggestion import AISuggestionRequest
from db.models.db_config import DBConfig
from db.models.user_document import UserDocument
from typing import List, Any
from helper.pipelines.db_query import get_db_schema, get_db_connection_string
from helper.pipelines.excel_query import get_excel_schema
import pandas as pd
import re, json, random, os
from helper.openai import openai_chat_completion_with_retry
from helper.aws_s3 import download_from_s3


def get_csv_schema(csv_path: str) -> str:
    """
    Returns the head of the csv file.

    Args:
        csv_path (str): The path to the CSV file.

    Returns:
        str: The schema of the CSV file.

    """
    df = pd.read_csv(csv_path)
    csv_schema = f"""
    The schema of the csv file is as follows:
    {df.head()}
    """

    return csv_schema


def extract_json(text: str) -> dict | Any:
    """
    Extracts the JSON from the text.

    Args:
        text (str): The text containing the JSON.

    Returns:
        dict | Any: The extracted JSON.

    """
    # assuming we have received json in ```json``` format
    json_text = re.search(r"```json(.*)```", text, re.DOTALL)
    if json_text:
        return json_text.group(1)

    # assuming we have received json in ``` ``` format
    json_text = re.search(r"```(.*)```", text, re.DOTALL)
    if json_text:
        return json_text.group(1)

    # assuming we have received json in plain text format
    json_text = text


def suggestion_pipeline(
    request: AISuggestionRequest, data_source: UserDocument | DBConfig
) -> List[str]:
    """
    Gives 3-5 suggestions for a given query and data source.

    Args:
        request (AISuggestionRequest): The AISuggestionRequest object containing the request details.
        data_source (UserDocument | DBConfig): The data source (CSV file or database) for the suggestions.

    Returns:
        List[str]: A list of suggested queries.

    """
    # openai_client = OpenAI(api_key=Config.OPENAI_API_KEY)

    output_format = """
    You should output a JSON object with a key "suggestions" which should contain
    a list of strings. Each string should be a suggested query which the user
    might be interested in. The format is as follows:
    {
        "suggestions": ["suggested query 1", "suggested query 2", "suggested query 3"]
    }

    Please make sure to output only JSON by enclosing it within 3 backticks.
    """

    if request.data_source_id is None:
        # Check if its the first question
        if request.is_first_request:
            logger.debug("Case 1: First request with no data source or last question")
            system_prompt = f"""
            You are an helpful assistance with data analyst and database expertise. Your job is to
            to suggest 3-4 easy question that the user might be interested in or might query
            """
            user_prompt = f"""
            Suggest some general question that user can ask. Please note that the
            user has not asked any question yet and might be interested in general question
            related to data science, analytics or database.
            {output_format}
            """
        else:
            logger.debug("Case 2: First request with last question but no data source")
            system_prompt = f"""
            You are an assistance with data analyst and database expertise. Your job is
            to suggest 3-4 follow-up questions that the user might be interested in based on the
            last query of the user
            """

            user_prompt = f"""
            The last query of the user was:
            {request.last_ques}
            Suggest some queries that the user might be interested in.
            {output_format}
            """
    else:
        last_ques_str = (
            f"The last query of the user was: {request.last_ques}"
            if request.last_ques
            else "This is the first query of the user"
        )
        if isinstance(data_source, UserDocument):
            logger.debug(f"Case 3: Data source is a {data_source.document_type} file")

            doc_s3_url = data_source.document_url
            object_url = doc_s3_url.split("amazonaws.com/")[-1]
            file_extension = object_url.split(".")[-1]
            temp_file_name = random.randbytes(10).hex() + "." + file_extension
            temp_file_path = f"./tmp/{temp_file_name}"
            if not download_from_s3(object_url, temp_file_path):
                logger.error(f"Could not download the file from S3: {object_url}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not download the file from S3",
                )

            system_prompt = f"""
            You are an assistance with data analyst and database expertise. Your job is
            to suggest 3-4 follow-up question that the user might be interested in based on the
            {data_source.document_type} file and user's last query.
            """
            user_prompt = f"""
            The {data_source.document_type} file has the following schema:
            {get_csv_schema(temp_file_path) if data_source.document_type == "csv" else get_excel_schema(temp_file_path)}

            {last_ques_str}
            Suggest some follow-up question that the user might be interested in.
            {output_format}
            """

            os.remove(temp_file_path)
        else:
            logger.debug("Case 4: Data source is a database")
            db_config = data_source.db_config
            db_url = get_db_connection_string(
                db_type=data_source.db_type,
                db_user=db_config["user"],
                db_password=db_config["password"],
                db_host=db_config["hostname"],
                db_port=db_config["port"],
                db_name=db_config["dbname"],
            )
            system_prompt = f"""
            You are an assistance with data analyst and database expertise. Your job is
            to suggest 3-4 follow-up question that the user might be interested in based on the
            database schema. The follow-up should be natural language not SQL queries.
            """
            user_prompt = f"""
            The database schema is as follows:
            {get_db_schema(db_url)}
            {last_ques_str}
            Suggest some follow-up question that the user might be interested in.
            The follow-up should be natural language not SQL queries.
            {output_format}
            """

    response_text = openai_chat_completion_with_retry(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        model=Config.DEFAULT_LLM_MODEL,
    )
    logger.debug(f"OpenAI response: {response_text}")
    suggestions = extract_json(response_text)
    try:
        suggestions = json.loads(suggestions)
    except json.JSONDecodeError:
        logger.error(f"Could not decode the suggestions: {suggestions}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not decode the suggestions",
        )
    logger.debug(f"Suggestions: {suggestions['suggestions']}")

    return suggestions["suggestions"]
