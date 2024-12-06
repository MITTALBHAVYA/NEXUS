from unittest import TestCase, mock
from fastapi import Response, status
from api.base import get_system_health


class TestSystemHealth(TestCase):
    @mock.patch("api.base.logger")
    async def test_get_system_health(self, mock_logger):
        response = Response()
        result = await get_system_health(response)

        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.message, "System is healthy")
        self.assertEqual(result.data, {"status": "UP"})

        mock_logger.info.assert_called_with("Checking system health")
        mock_logger.info.assert_called_with("System is healthy")
