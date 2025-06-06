import os
from datetime import datetime

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .models import Base, Transaction, TransactionType

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

sample_transactions = [
    {
        "userId": 1,
        "type": TransactionType.income,
        "amount": 7500000,
        "description": "Gaji Bulanan",
        "category": "Gaji",
        "date": datetime(2025, 5, 1),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.expense,
        "amount": 2500000,
        "description": "Sewa Kost",
        "category": "Tempat Tinggal",
        "date": datetime(2025, 5, 5),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.expense,
        "amount": 350000,
        "description": "Belanja Groceries",
        "category": "Makanan",
        "date": datetime(2025, 5, 10),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.expense,
        "amount": 65000,
        "description": "Langganan Netflix",
        "category": "Hiburan",
        "date": datetime(2025, 5, 15),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.income,
        "amount": 1500000,
        "description": "Freelance Design",
        "category": "Sampingan",
        "date": datetime(2025, 5, 18),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.expense,
        "amount": 150000,
        "description": "Makan di Warteg",
        "category": "Makan Luar",
        "date": datetime(2025, 5, 20),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.expense,
        "amount": 450000,
        "description": "Tagihan Listrik PLN",
        "category": "Utilitas",
        "date": datetime(2025, 5, 25),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.expense,
        "amount": 50000,
        "description": "Bensin Motor",
        "category": "Transportasi",
        "date": datetime(2025, 5, 28),
        "created_at": datetime.now(),
    },
    {
        "userId": 1,
        "type": TransactionType.income,
        "amount": 800000,
        "description": "Bonus Lebaran",
        "category": "Bonus",
        "date": datetime(2025, 5, 30),
        "created_at": datetime.now(),
    },
    {
        "userId": 2,
        "type": TransactionType.income,
        "amount": 6500000,
        "description": "Gaji Bulanan",
        "category": "Gaji",
        "date": datetime(2025, 6, 1),
        "created_at": datetime.now(),
    },
]


def create_tables():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


def seed_database():
    """Seed the database with sample transaction data."""
    db = SessionLocal()
    try:
        # Clear existing data (optional)
        db.query(Transaction).delete()
        db.commit()
        print("Cleared existing transaction data")

        # Create transaction objects
        transactions = []
        for transaction_data in sample_transactions:
            transaction = Transaction(**transaction_data)
            transactions.append(transaction)

        # Add transactions to the session
        db.add_all(transactions)
        db.commit()

        print(f"Successfully seeded {len(transactions)} transactions")

        # Verify the data was inserted
        count = db.query(Transaction).count()
        print(f"Total transactions in database: {count}")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Main function to create tables and seed data."""
    try:
        print("Starting database seeding process...")
        create_tables()
        seed_database()
        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error during seeding process: {e}")
        exit(1)


if __name__ == "__main__":
    main()
