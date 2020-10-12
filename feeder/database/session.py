from databases import Database
from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base

from feeder import settings


db = Database(f"sqlite:///{settings.database_path}")

Base = declarative_base()
metadata = MetaData()
