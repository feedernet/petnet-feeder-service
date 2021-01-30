"""Make most gateway/device fields optional

Revision ID: 317ddf3509cb
Revises: 390373fdfa3c
Create Date: 2020-10-12 20:40:12.969961

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "317ddf3509cb"
down_revision = "390373fdfa3c"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("kronos_device") as batch_op:
        batch_op.alter_column("name", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("softwareName", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("softwareVersion", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("type", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("uid", existing_type=sa.TEXT(), nullable=True)
    with op.batch_alter_table("kronos_gateway") as batch_op:
        batch_op.alter_column("name", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("osName", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("sdkVersion", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("softwareName", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("softwareVersion", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("type", existing_type=sa.TEXT(), nullable=True)
        batch_op.alter_column("uid", existing_type=sa.TEXT(), nullable=True)


def downgrade():
    connection = op.get_bind()
    connection.execute("pragma foreign_keys=OFF")
    for field_name in [
        "uid",
        "type",
        "softwareVersion",
        "softwareName",
        "osName",
        "sdkVersion",
        "name",
    ]:
        connection.execute(
            f"UPDATE kronos_gateway SET {field_name} = 'unknown' WHERE {field_name} IS NULL"
        )

    for field_name in ["uid", "type", "softwareVersion", "softwareName", "name"]:
        connection.execute(
            f"UPDATE kronos_device SET {field_name} = 'unknown' WHERE {field_name} IS NULL"
        )

    with op.batch_alter_table("kronos_gateway") as batch_op:
        batch_op.alter_column("uid", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("type", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column(
            "softwareVersion", existing_type=sa.TEXT(), nullable=False
        )
        batch_op.alter_column("softwareName", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("sdkVersion", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("osName", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("name", existing_type=sa.TEXT(), nullable=False)
    with op.batch_alter_table("kronos_device") as batch_op:
        batch_op.alter_column("uid", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("type", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column(
            "softwareVersion", existing_type=sa.TEXT(), nullable=False
        )
        batch_op.alter_column("softwareName", existing_type=sa.TEXT(), nullable=False)
        batch_op.alter_column("name", existing_type=sa.TEXT(), nullable=False)

    connection.execute("pragma foreign_keys=ON")
