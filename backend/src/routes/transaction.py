from datetime import datetime

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.database.models import Transaction, get_db

router = APIRouter()


class TransactionCreate(BaseModel):
    type: str
    amount: int
    description: str
    category: str
    date: datetime


class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: int
    description: str
    category: str
    date: datetime
    created_at: datetime


@router.get("/transactions")
async def get_transactions(db: Session = Depends(get_db)) -> list[TransactionResponse]:
    try:
        transactions = db.query(Transaction).all()
        if not transactions:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "No transactions found"},
            )

        return transactions

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": str(e)},
        )


@router.post("/transactions")
async def create_transaction(
    transaction: TransactionCreate, db: Session = Depends(get_db)
):
    try:
        new_transaction = Transaction(
            type=transaction.type,
            amount=transaction.amount,
            description=transaction.description,
            category=transaction.category,
            date=transaction.date,
        )
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        return new_transaction

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": str(e)},
        )


@router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    try:
        transaction = (
            db.query(Transaction).filter(Transaction.id == transaction_id).first()
        )

        if not transaction:
            print(f"Transaction with ID {transaction_id} not found")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Transaction not found"},
            )

        db.delete(transaction)
        db.commit()
        return {"detail": "Transaction deleted successfully"}

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": str(e)},
        )
