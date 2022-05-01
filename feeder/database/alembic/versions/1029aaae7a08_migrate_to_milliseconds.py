"""migrate to milliseconds

Revision ID: 1029aaae7a08
Revises: 593d4ecb0616
Create Date: 2022-05-01 09:09:40.989955

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "1029aaae7a08"
down_revision = "593d4ecb0616"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE feed_event SET start_time = start_time / 1000, end_time = end_time / 1000, timestamp = timestamp / 1000"
    )
    op.execute(
        "UPDATE kronos_device SET discoveredAt = discoveredAt / 1000, lastPingedAt = lastPingedAt / 1000"
    )
    op.execute("UPDATE kronos_device_sensors SET timestamp = timestamp / 1000")
    op.execute("UPDATE hopper_references SET timestamp = timestamp / 1000")
    op.execute("UPDATE kronos_gateway SET discoveredAt = discoveredAt / 1000")
    op.execute("UPDATE pets SET birthday = birthday / 1000")


def downgrade():
    op.execute(
        "UPDATE feed_event SET start_time = start_time * 1000, end_time = end_time * 1000, timestamp = timestamp * 1000"
    )
    op.execute(
        "UPDATE kronos_device SET discoveredAt = discoveredAt * 1000, lastPingedAt = lastPingedAt * 1000"
    )
    op.execute("UPDATE kronos_device_sensors SET timestamp = timestamp * 1000")
    op.execute("UPDATE hopper_references SET timestamp = timestamp * 1000")
    op.execute("UPDATE kronos_gateway SET discoveredAt = discoveredAt * 1000")
    op.execute("UPDATE pets SET birthday = birthday * 1000")
