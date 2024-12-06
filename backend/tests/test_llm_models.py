from unittest import TestCase, mock
from fastapi import status
from api.v1.llm_models import get_llm_models
from data_response.base_response import APIResponseBase
from fastapi import Response


class TestLLMModels(TestCase):
    @mock.patch("api.v1.llm_models.logger")
    async def test_get_llm_models(self, mock_logger):
        response = mock.Mock(spec=Response)

        result = await get_llm_models(response)

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.message, "LLM models fetched successfully")
        self.assertEqual(result.data, ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo-0125"])

        response.status_code.assert_called_with(status.HTTP_200_OK)
