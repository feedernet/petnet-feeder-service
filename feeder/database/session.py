from databases import Database
from sqlalchemy import MetaData
from sqlalchemy import event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import Pool

from feeder import settings

@event.listens_for(Pool, 'checkout')
def _fk_pragma_on_connect(dbapi_con, con_record, con_proxy):
    dbapi_con.execute('pragma foreign_keys=ON')

db = Database(f"sqlite:///{settings.database_path}")

Base = declarative_base()
metadata = MetaData()
