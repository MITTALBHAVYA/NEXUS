from pydantic import BaseModel
from typing import Optional, List


class AISuggestionRequest(BaseModel):
    """
    Represents a request for AI suggestions.

    Attributes:
        last_ques (str, optional): The last question asked. Defaults to None.
        data_source_id (int, optional): The ID of the data source. Defaults to None.
        query_type (str, optional): The type of query. Defaults to None.
        is_first_request (bool): Indicates if it is the first request. Defaults to False.
    """

    last_ques: Optional[str] = None
    data_source_id: Optional[int] = None
    query_type: Optional[str] = None
    is_first_request: bool = False


class AISuggestionResponse(BaseModel):
    """
    Represents a response containing AI suggestions.

    Attributes:
        suggestions (List[str]): A list of suggested strings.
    """

    suggestions: List[str]
