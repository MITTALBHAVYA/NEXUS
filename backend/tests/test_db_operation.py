from unittest import TestCase, mock
from fastapi import status
from api.v1.db_operation import create_new_db, get_db_config
from schemas.db_config import NewDBCreateRequest
from data_response.base_response import APIResponseBase
from sqlalchemy.orm import Session


class TestDBOperation(TestCase):
    @mock.patch("api.v1.db_operation.logger")
    @mock.patch("api.v1.db_operation.DBConfigQuery")
    async def test_create_new_db(self, mock_db_config_query, mock_logger):
        request = NewDBCreateRequest(
            db_type="mysql",
            db_config={
                "host": "localhost",
                "port": 3306,
                "username": "root",
                "password": "password",
                "database": "test_db",
            },
        )
        response = mock.Mock()
        db = mock.Mock(spec=Session)
        current_user = mock.Mock()

        mock_db_config_query.create_db_config.return_value = True
        result = await create_new_db(request, response, db, current_user)

        self.assertEqual(result.status_code, status.HTTP_201_CREATED)
        self.assertEqual(result.message, "DB config created successfully")
        self.assertEqual(
            result.data.db_config_id,
            mock_db_config_query.create_db_config.return_value.id,
        )

        mock_logger.debug.assert_called_with(f"Request: {request}")
        mock_db_config_query.create_db_config.assert_called_with(
            db,
            current_user.uuid,
            request.db_type,
            request.db_config,
        )
        db.commit.assert_called_once()

    @mock.patch("api.v1.db_operation.logger")
    @mock.patch("api.v1.db_operation.DBConfigQuery")
    async def test_get_db_config(self, mock_db_config_query, mock_logger):
        response = mock.Mock()
        db = mock.Mock(spec=Session)
        current_user = mock.Mock()
        db_configs = [mock.Mock(), mock.Mock()]

        mock_db_config_query.get_db_config_by_customer_uuid.return_value = db_configs
        result = await get_db_config(response, db, current_user)

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.message, "DB config found")
        self.assertEqual(
            result.data["db_configs"],
            [db_config.to_dict() for db_config in db_configs],
        )
        self.assertEqual(result.data["customer_uuid"], current_user.uuid)

        mock_db_config_query.get_db_config_by_customer_uuid.assert_called_with(
            db, current_user.uuid
        )
        mock_logger.error.assert_not_called()
