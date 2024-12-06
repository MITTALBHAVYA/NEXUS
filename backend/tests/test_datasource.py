from unittest import TestCase, mock
from fastapi import Response, status
from api.v1.datasource import get_datasources


class TestDatasource(TestCase):
    @mock.patch("api.v1.datasource.DBConfigQuery")
    @mock.patch("api.v1.datasource.UserDocumentQuery")
    async def test_get_datasources(
        self, mock_user_document_query, mock_db_config_query
    ):
        mock_db = mock.MagicMock()
        mock_response = Response()
        mock_current_user = mock.MagicMock()
        mock_current_user.uuid = "12345"

        mock_db_config_query.get_db_config_by_customer_uuid.return_value = [
            mock.MagicMock(to_dict=mock.MagicMock(return_value={"db_config": "data"}))
        ]
        mock_user_document_query.get_user_documents_by_customer_uuid.return_value = [
            mock.MagicMock(to_dict=mock.MagicMock(return_value={"user_doc": "data"}))
        ]

        result = await get_datasources(
            response=mock_response, current_user=mock_current_user, db=mock_db
        )

        mock_db_config_query.get_db_config_by_customer_uuid.assert_called_once_with(
            mock_db, mock_current_user.uuid
        )
        mock_user_document_query.get_user_documents_by_customer_uuid.assert_called_once_with(
            mock_db, mock_current_user.uuid
        )

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.message, "Datasources fetched successfully")
        self.assertEqual(
            result.data,
            {
                "db_configs": [{"db_config": "data"}],
                "user_docs": [{"user_doc": "data"}],
                "customer_uuid": "12345",
            },
        )
