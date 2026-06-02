from sqlalchemy import event
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from feeder import settings

engine = create_async_engine(f"sqlite+aiosqlite:///{settings.database_path}")


# Enable foreign keys for SQLite
@event.listens_for(engine.sync_engine, "connect")
def _fk_pragma_on_connect(dbapi_con, con_record):
    dbapi_con.execute("pragma foreign_keys=ON")


async_session = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()
metadata = Base.metadata
