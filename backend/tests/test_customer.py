from unittest import TestCase, mock
from fastapi import Response, status
from api.v1.customer import (
    register_customer,
    login_customer,
    refresh_access_token,
)
from schemas.customer import (
    CustomerRegisterRequest,
    CustomerLoginRequest,
)
from db import get_db
from sqlalchemy.orm import Session
from db.queries.customer import CustomerQuery
from helper.auth import JWTHandler
from data_response.base_response import APIResponseBase


class TestCustomer(TestCase):
    @mock.patch("api.v1.customer.logger")
    async def test_register_customer(self, mock_logger):
        request = CustomerRegisterRequest(
            name="John Doe",
            email="johndoe@example.com",
            password="password",
        )
        response = Response()
        db = Session()

        with mock.patch.object(
            CustomerQuery, "get_customer_by_email"
        ) as mock_get_customer_by_email:
            mock_get_customer_by_email.return_value = None

            with mock.patch.object(
                CustomerQuery, "create_customer"
            ) as mock_create_customer:
                mock_create_customer.return_value = True

                with mock.patch.object(db, "commit") as mock_commit:
                    result = await register_customer(request, response, db)

                    self.assertEqual(result.status_code, status.HTTP_201_CREATED)
                    self.assertEqual(result.message, "Customer created successfully")

                    mock_logger.error.assert_not_called()
                    mock_commit.assert_called_once()

    @mock.patch("api.v1.customer.logger")
    async def test_login_customer(self, mock_logger):
        request = CustomerLoginRequest(
            email="johndoe@example.com",
            password="password",
        )
        response = Response()
        db = Session()

        with mock.patch.object(
            CustomerQuery, "get_customer_by_email_password"
        ) as mock_get_customer_by_email_password:
            mock_get_customer_by_email_password.return_value = True

            with mock.patch.object(
                JWTHandler, "create_access_token"
            ) as mock_create_access_token:
                mock_create_access_token.return_value = "access_token"

                with mock.patch.object(
                    JWTHandler, "create_refresh_token"
                ) as mock_create_refresh_token:
                    mock_create_refresh_token.return_value = "refresh_token"

                    with mock.patch.object(
                        CustomerQuery, "update_customer_last_login"
                    ) as mock_update_customer_last_login:
                        result = await login_customer(request, response, db)

                        self.assertEqual(result.status_code, status.HTTP_200_OK)
                        self.assertEqual(result.message, "Login successful")

                        mock_logger.error.assert_not_called()
                        mock_update_customer_last_login.assert_called_once()

    @mock.patch("api.v1.customer.logger")
    async def test_refresh_access_token(self, mock_logger):
        authorization = "Bearer refresh_token"
        response = Response()
        db = Session()

        with mock.patch.object(
            JWTHandler, "decode_refresh_token"
        ) as mock_decode_refresh_token:
            mock_decode_refresh_token.return_value = True

            with mock.patch.object(
                CustomerQuery, "get_customer_by_uuid"
            ) as mock_get_customer_by_uuid:
                mock_get_customer_by_uuid.return_value = True

                with mock.patch.object(
                    JWTHandler, "create_access_token"
                ) as mock_create_access_token:
                    mock_create_access_token.return_value = "access_token"

                    result = await refresh_access_token(response, authorization, db)

                    self.assertEqual(result.status_code, status.HTTP_200_OK)
                    self.assertEqual(
                        result.message, "Access token refreshed successfully"
                    )

                    mock_logger.error.assert_not_called()


