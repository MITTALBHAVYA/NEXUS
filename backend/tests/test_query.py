from unittest import TestCase, mock
from fastapi import status
from api.v1.query import query
from data_response.base_response import APIResponseBase
from db.queries.db_config import DBConfigQuery
from db.queries.user_documents import UserDocumentQuery
from db import get_db
from sqlalchemy.orm import Session
from helper.auth import AccessTokenData
from fastapi import Response


class TestQuery(TestCase):
    @mock.patch("api.v1.query.DBConfigQuery.get_db_config_by_id")
    @mock.patch("api.v1.query.csv_pipeline")
    async def test_query_csv(
        self,
        mock_csv_pipeline,
        mock_get_db_config_by_id,
    ):
        request = mock.Mock()
        response = mock.Mock(spec=Response)
        db = mock.Mock(spec=Session)
        current_user = mock.Mock(spec=AccessTokenData)

        mock_get_db_config_by_id.return_value = None
        mock_csv_pipeline.return_value = "csv_result"

        result = await query("csv", request, response, current_user=current_user, db=db)

        self.assertEqual(result.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(result.message, "This API is deprecated. Please use v2 API")

        response.status_code.assert_called_with(status.HTTP_400_BAD_REQUEST)

    @mock.patch("api.v1.query.DBConfigQuery.get_db_config_by_id")
    @mock.patch("api.v1.query.db_config_pipeline")
    async def test_query_db(
        self,
        mock_db_config_pipeline,
        mock_get_db_config_by_id,
    ):
        request = mock.Mock()
        response = mock.Mock(spec=Response)
        db = mock.Mock(spec=Session)
        current_user = mock.Mock(spec=AccessTokenData)

        mock_get_db_config_by_id.return_value = "db_config"
        mock_db_config_pipeline.return_value = ("db_result", "sql_query")

        result = await query("db", request, response, current_user=current_user, db=db)

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.message, "Query successful")
        self.assertEqual(
            result.data,
            {
                "query": request.query,
                "response": "db_result",
                "sql_query": "sql_query",
                "data_source_id": request.data_source_id,
            },
        )

        response.status_code.assert_called_with(status.HTTP_200_OK)

    async def test_query_invalid_type(self):
        request = mock.Mock()
        response = mock.Mock(spec=Response)
        db = mock.Mock(spec=Session)
        current_user = mock.Mock(spec=AccessTokenData)

        result = await query(
            "invalid_type", request, response, current_user=current_user, db=db
        )

        self.assertEqual(result.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(result.message, "Invalid query type")

        response.status_code.assert_called_with(status.HTTP_400_BAD_REQUEST)
