"""add_is_google_user_to_customers

Revision ID: 202872d1cf31
Revises: e057c5581fd8
Create Date: 2025-05-25 20:17:29.260587

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '202872d1cf31'
down_revision: Union[str, None] = 'e057c5581fd8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
