import enum
import os

from dotenv import load_dotenv
from sqlalchemy import (Column, DateTime, Enum, Integer, Text, create_engine,
                        func)
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class TransactionType(enum.Enum):
    income = "income"
    expense = "expense"


class Transaction(Base):
    __tablename__ = "transactions_table"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column("user_id", Integer, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
