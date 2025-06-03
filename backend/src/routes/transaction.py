from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.database.models import Transaction, get_db

router = APIRouter()


class TransactionCreate(BaseModel):
    userId: int
    type: str
    amount: int
    description: str
    category: str
    date: str


@router.get("/transactions")
async def get_transactions_by_user_id(userId: int, db: Session = Depends(get_db)):
    try:
        transactions = db.query(Transaction).filter(Transaction.userId == userId).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

    if not transactions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transactions found for this user",
        )

    return transactions


@router.post("/transactions")
async def create_transaction(
    transaction: TransactionCreate, db: Session = Depends(get_db)
):
    try:
        new_transaction = Transaction(
            userId=transaction.userId,
            type=transaction.type,
            amount=transaction.amount,
            description=transaction.description,
            category=transaction.category,
            date=transaction.date,
        )
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return new_transaction


@router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    try:
        transaction = (
            db.query(Transaction).filter(Transaction.id == transaction_id).first()
        )

        print(f"Deleting transaction with ID: {transaction_id}")
        print(f"Transaction found: {transaction}")

        if not transaction:
            print(f"Transaction with ID {transaction_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
            )

        db.delete(transaction)
        db.commit()

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

    return {"detail": "Transaction deleted successfully"}
