from unittest import TestCase, mock
from fastapi import status
from api.v1.query_suggestions import get_suggestion_based_on_query
from data_response.base_response import APIResponseBase
from db.queries.db_config import DBConfigQuery
from db.queries.user_documents import UserDocumentQuery
from db import get_db
from sqlalchemy.orm import Session
from helper.auth import AccessTokenData
from fastapi import Response


class TestQuerySuggestions(TestCase):
    @mock.patch("api.v1.query_suggestions.DBConfigQuery.get_db_config_by_id")
    @mock.patch("api.v1.query_suggestions.UserDocumentQuery.get_user_document_by_id")
    @mock.patch("api.v1.query_suggestions.suggestion_pipeline")
    async def test_get_suggestion_based_on_query(
        self,
        mock_suggestion_pipeline,
        mock_get_user_document_by_id,
        mock_get_db_config_by_id,
    ):
        request = mock.Mock()
        response = mock.Mock(spec=Response)
        db = mock.Mock(spec=Session)
        current_user = mock.Mock(spec=AccessTokenData)

        mock_get_db_config_by_id.return_value = None
        mock_get_user_document_by_id.return_value = None
        mock_suggestion_pipeline.return_value = ["suggestion1", "suggestion2"]

        result = await get_suggestion_based_on_query(
            request, response, db=db, current_user=current_user
        )

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.message, "Suggestions fetched successfully")
        self.assertEqual(result.data, {"suggestions": ["suggestion1", "suggestion2"]})

        response.status_code.assert_called_with(status.HTTP_200_OK)
