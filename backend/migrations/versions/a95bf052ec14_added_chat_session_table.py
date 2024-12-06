"""added_chat_session_table

Revision ID: a95bf052ec14
Revises: d1045725ab03
Create Date: 2024-07-02 18:55:14.940497

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a95bf052ec14'
down_revision: Union[str, None] = 'd1045725ab03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('chat_sessions',
    sa.Column('chat_session_id', sa.Integer(), nullable=False),
    sa.Column('session_key', sa.String(length=255), nullable=False),
    sa.Column('message', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
    sa.PrimaryKeyConstraint('chat_session_id')
    )
    op.create_index(op.f('ix_chat_sessions_session_key'), 'chat_sessions', ['session_key'], unique=False)
    op.create_unique_constraint(None, 'charts', ['uuid'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'charts', type_='unique')
    op.drop_index(op.f('ix_chat_sessions_session_key'), table_name='chat_sessions')
    op.drop_table('chat_sessions')
    # ### end Alembic commands ###
