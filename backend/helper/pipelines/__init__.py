import re
from llama_index.llms.openai import OpenAI
from config import Config
from fastapi import HTTPException, status
from typing import Any, Dict, List, Optional
from llama_index.llms.gemini import Gemini
from llama_index.llms.openai import OpenAI
from llama_index.llms.anthropic import Anthropic
from typing import Any
from config import Config


def post_processed_html_response(response: str) -> str:
    """
    Extracts processed HTML content from the given response.

    Args:
        response (str): The response string to extract processed HTML from.

    Returns:
        str: The extracted processed HTML content, if found. Otherwise, returns the original response.
    """

    processed_html = re.search(r"```html(.*)```", response, re.DOTALL)
    if processed_html:
        return processed_html.group(1)

    processed_html = re.search(r"```(.*)```", response, re.DOTALL)
    if processed_html:
        return processed_html.group(1)

    return response


def get_llm_by_model(
    model: str = None, temperature: float = 0.0, top_p: float = 0.0
) -> Any:
    """
    Retrieves the LLM instance based on the given model, temperature, and top_p.

    Args:
        model (str): The model name.
        temperature (float): The temperature value for generating responses.
        top_p (float): The top_p value for generating responses.

    Returns:
        Any: The LLM instance based on the given model.
    """
    if model is None:
        model = Config.DEFAULT_LLM_MODEL

    if "gemini" in model.lower():
        return Gemini(
            api_key=Config.GOOGLE_API_KEY,
            model=f"models/{model}",
            temperature=temperature,
            top_p=top_p,
        )

    if "gpt" in model.lower():
        return OpenAI(
            api_key=Config.OPENAI_API_KEY,
            model=model,
            temperature=temperature,
            top_p=top_p,
        )

    if "claude" in model.lower():
        return Anthropic(
            api_key=Config.ANTHROPIC_API_KEY,
            model=model,
            temperature=temperature,
            # top_p=top_p, does not support top_p
        )

    raise ValueError(f"Model {model} not found.")
