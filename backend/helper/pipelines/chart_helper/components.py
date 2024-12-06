from typing import Any, Dict, List, Optional

from llama_index.core.query_pipeline import (
    CustomQueryComponent,
)
from pydantic import Field
from llama_index.core.llms import ChatMessage
import json
import pandas as pd
from helper.pipelines.chart_helper import extract_backticks_content
from helper.pipelines.chart_helper.schemas import (
    BarChartData,
    AreaChartData,
    LineChartData,
    PieChartData,
    RadarChartData,
)


class ChartTypeSelector(CustomQueryComponent):
    llm: Any = Field(..., description="LLM")
    system_prompt: Optional[str] = Field(
        default=None, description="System prompt to use for the LLM"
    )
    context_prompt: Optional[str] = Field(
        description="Context prompt to use for the LLM",
    )

    def _validate_component_inputs(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """Validate component inputs during run_component."""
        return input

    @property
    def _input_keys(self) -> set:
        """Input keys dict."""
        return {"chat_history", "query_str", "data_schema"}

    @property
    def _output_keys(self) -> set:
        return {"chart_type"}

    def _prepare_context(
        self,
        chat_history: List[ChatMessage],
        query_str: str,
        data_schema: str,
    ) -> List[ChatMessage]:

        formatted_context = self.context_prompt.replace(
            "{query_str}", query_str
        ).replace("{data_schema}", data_schema)
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
        data_schema = kwargs["data_schema"]

        prepared_context = self._prepare_context(chat_history, query_str, data_schema)
        response = self.llm.chat(prepared_context)
        chart_type = json.loads(extract_backticks_content(response, "json"))[
            "chart_type"
        ]
        return {"chart_type": chart_type}

    async def _arun_component(self, **kwargs: Any) -> Dict[str, Any]:
        """Run the component asynchronously."""
        chat_history = kwargs["chat_history"]
        query_str = kwargs["query_str"]
        data_schema = kwargs["data_schema"]

        prepared_context = self._prepare_context(chat_history, query_str, data_schema)
        response = await self.llm.achat(prepared_context)

        chart_type = json.loads(extract_backticks_content(response, "json"))[
            "chart_type"
        ]
        return {"chart_type": chart_type}


def chart_data_schema_tool(chart_type: str) -> str:
    print("Chart type : ", chart_type)
    if chart_type not in ["bar", "area", "line", "pie", "radar"]:
        raise Exception(f"Invalid chart_type : '{chart_type}'")

    return """
    ```
    [
        {
            "<LABEL>":"<VALUE: It should be a string>",
            "<METRIC_NAME_1>":<VALUE: It should be a number>,
            "<METRIC_NAME_2>":<VALUE: It should be a number>,
        }, 
        {
            "<LABEL>":"<VALUE: It should be a string>",
            "<METRIC_NAME_1>":<VALUE: It should be a number>,
            "<METRIC_NAME_2>":<VALUE: It should be a number>,
        }
    ]
    ```
"""


class ChartDataGeneratorViaPython(CustomQueryComponent):
    llm: Any = Field(..., description="LLM")
    system_prompt: Optional[str] = Field(
        default=None, description="System prompt to use for the LLM"
    )
    context_prompt: Optional[str] = Field(
        description="Context prompt to use for the LLM",
    )

    def _validate_component_inputs(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """Validate component inputs during run_component."""
        return input

    @property
    def _input_keys(self) -> set:
        """Input keys dict."""
        return {
            "chat_history",
            "query_str",
            "chart_type",
            "chart_schema",
            "data_schema",
        }

    @property
    def _output_keys(self) -> set:
        return {"python_code"}

    def _prepare_context(
        self,
        chat_history: List[ChatMessage],
        query_str: str,
        chart_type: str,
        chart_schema: str,
        data_schema: str,
    ) -> List[ChatMessage]:

        formatted_context = (
            self.context_prompt.replace("{query_str}", query_str)
            .replace("{chart_type}", chart_type)
            .replace("{chart_schema}", chart_schema)
            .replace("{data_schema}", data_schema)
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
        chart_type = kwargs["chart_type"]
        chart_schema = kwargs["chart_schema"]
        data_schema = kwargs["data_schema"]

        # chart_type = extract_backticks_content(chart_type, "json")
        # chart_type = json.loads(chart_type)["chart_type"]

        prepared_context = self._prepare_context(
            chat_history, query_str, chart_type, chart_schema, data_schema
        )
        response = self.llm.chat(prepared_context)

        return {"python_code": response}

    async def _arun_component(self, **kwargs: Any) -> Dict[str, Any]:
        """Run the component asynchronously."""
        chat_history = kwargs["chat_history"]
        query_str = kwargs["query_str"]
        chart_type = kwargs["chart_type"]
        chart_schema = kwargs["chart_schema"]
        data_schema = kwargs["data_schema"]

        # chart_type = extract_backticks_content(chart_type, "json")
        # chart_type = json.loads(chart_type)["chart_type"]

        prepared_context = self._prepare_context(
            chat_history, query_str, chart_type, chart_schema, data_schema
        )
        response = await self.llm.achat(prepared_context)

        return {"python_code": response}


class ChartDataCodeExecutor(CustomQueryComponent):
    df: Optional[Any] = None
    conn: Optional[Any] = None

    def _validate_component_inputs(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """Validate component inputs during run_component."""
        return input

    @property
    def _input_keys(self) -> set:
        """Input keys dict."""
        return {"python_code"}

    @property
    def _output_keys(self) -> set:
        return {"chart_data"}

    def _run_component(self, **kwargs) -> Dict[str, Any]:
        """Run the component."""
        python_code = kwargs["python_code"]
        if self.df is not None:
            global_dict = {"df": self.df}
        else:
            global_dict = {"conn": self.conn}
        print("global_dict: ", global_dict)
        print(extract_backticks_content(python_code, "python"))
        exec(extract_backticks_content(python_code, "python"), global_dict)

        response = global_dict["chart_data"]

        return {"chart_data": response}

    async def _arun_component(self, **kwargs: Any) -> Dict[str, Any]:
        """Run the component asynchronously."""
        python_code = kwargs["python_code"]
        if self.df is not None:
            global_dict = {"df": self.df}
        else:
            global_dict = {"conn": self.conn}

        exec(extract_backticks_content(python_code, "python"), global_dict)

        response = global_dict["chart_data"]

        return {"chart_data": response}


def chart_validator_tool(chart_data: dict, chart_type: str) -> dict:
    chart_type_data = chart_type

    if chart_type_data == "bar":
        try:
            validator = BarChartData(root=chart_data)
        except Exception as e:
            print("Error during chart_validator_tool : ", e)
            return None
    elif chart_type_data == "area":
        try:
            validator = AreaChartData(root=chart_data)
        except Exception as e:
            print("Error during chart_validator_tool : ", e)
            return None
    elif chart_type_data == "line":
        try:
            validator = LineChartData(root=chart_data)
        except Exception as e:
            print("Error during chart_validator_tool : ", e)
            return None
    elif chart_type_data == "pie":
        try:
            validator = PieChartData(root=chart_data)
        except Exception as e:
            print("Error during chart_validator_tool : ", e)
            return None
    elif chart_type_data == "radar":
        try:
            validator = RadarChartData(root=chart_data)
        except Exception as e:
            print("Error during chart_validator_tool : ", e)
            return None
    else:
        raise Exception(f"Invalid chart_type : '{chart_type_data}'")
    return chart_data


class CaptionGenerator(CustomQueryComponent):
    llm: Any = Field(..., description="LLM")
    system_prompt: Optional[str] = Field(
        default=None, description="System prompt to use for the LLM"
    )
    context_prompt: Optional[str] = Field(
        description="Context prompt to use for the LLM",
    )

    def _validate_component_inputs(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """Validate component inputs during run_component."""
        return input

    @property
    def _input_keys(self) -> set:
        """Input keys dict."""
        return {"chat_history", "query_str", "validated_chart_data"}

    @property
    def _output_keys(self) -> set:
        return {"caption"}

    def _prepare_context(
        self,
        chat_history: List[ChatMessage],
        query_str: str,
    ) -> List[ChatMessage]:

        formatted_context = self.context_prompt.replace("{query_str}", query_str)

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

        prepared_context = self._prepare_context(
            chat_history,
            query_str,
        )
        # print("CaptionGenerator: ", prepared_context)
        response = self.llm.chat(prepared_context)

        return {"caption": response}

    async def _arun_component(self, **kwargs: Any) -> Dict[str, Any]:
        """Run the component asynchronously."""
        chat_history = kwargs["chat_history"]
        query_str = kwargs["query_str"]

        prepared_context = self._prepare_context(
            chat_history,
            query_str,
        )
        response = await self.llm.achat(prepared_context)

        return {"caption": response}
