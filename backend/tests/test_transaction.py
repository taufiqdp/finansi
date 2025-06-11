from datetime import datetime

from fastapi.testclient import TestClient

from src.database.models import Transaction, TransactionType


class TestTransactionEndpoints:

    def test_create_transaction_success(self, client: TestClient):
        """Test successful transaction creation"""
        transaction_data = {
            "type": "income",
            "amount": 1000,
            "description": "Salary payment",
            "category": "salary",
            "date": "2024-12-01T00:00:00",
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        print(response.json())
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "income"
        assert data["amount"] == 1000
        assert data["description"] == "Salary payment"
        assert data["category"] == "salary"
        assert "id" in data

    def test_create_transaction_invalid_type(self, client: TestClient):
        """Test transaction creation with invalid type"""
        transaction_data = {
            "type": "invalid_type",
            "amount": 1000,
            "description": "Test transaction",
            "category": "test",
            "date": datetime(2024, 12, 1).isoformat(),
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 500

    def test_create_transaction_invalid_date_format(self, client: TestClient):
        """Test transaction creation with invalid date format"""
        transaction_data = {
            "type": "income",
            "amount": 1000,
            "description": "Test transaction",
            "category": "test",
            "date": "invalid-date-format",
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 422

    def test_create_transaction_negative_amount(self, client: TestClient):
        """Test transaction creation with negative amount"""
        transaction_data = {
            "type": "expense",
            "amount": -100,
            "description": "Refund",
            "category": "refund",
            "date": datetime(2024, 12, 1).isoformat(),
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == -100

    def test_create_transaction_missing_required_fields(self, client: TestClient):
        """Test transaction creation without required fields"""
        transaction_data = {
            "type": "income",
            "amount": 1000,
            "description": "Test",
            "category": "test",
            # Missing date
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 422

    def test_create_transaction_empty_description(self, client: TestClient):
        """Test transaction creation with empty description"""
        transaction_data = {
            "type": "expense",
            "amount": 50,
            "description": "",
            "category": "misc",
            "date": datetime(2024, 12, 1).isoformat(),
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == ""

    def test_create_transaction_with_special_characters(self, client: TestClient):
        """Test transaction creation with special characters in description"""
        transaction_data = {
            "type": "expense",
            "amount": 25,
            "description": "Coffee @ Café & More! (15% tip)",
            "category": "food",
            "date": datetime(2024, 12, 1).isoformat(),
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Coffee @ Café & More! (15% tip)"

    def test_get_transactions_success(self, client: TestClient):
        """Test successful retrieval of all transactions"""
        response = client.get("/api/v1/transactions")
        assert response.status_code in [200, 404]  # 404 if no transactions exist

    def test_delete_transaction_zero_id(self, client: TestClient):
        """Test deletion with zero transaction ID"""
        response = client.delete("/api/v1/transactions/0")
        assert response.status_code == 404

    def test_delete_transaction_negative_id(self, client: TestClient):
        """Test deletion with negative transaction ID"""
        response = client.delete("/api/v1/transactions/-1")
        assert response.status_code == 404

    def test_create_transaction_very_long_description(self, client: TestClient):
        """Test transaction creation with very long description"""
        long_description = "A" * 1000
        transaction_data = {
            "type": "expense",
            "amount": 100,
            "description": long_description,
            "category": "test",
            "date": datetime(2024, 12, 1).isoformat(),
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == long_description

    def test_create_transaction_unicode_characters(self, client: TestClient):
        """Test transaction creation with unicode characters"""
        transaction_data = {
            "type": "expense",
            "amount": 50,
            "description": "Café français 🇫🇷",
            "category": "食物",
            "date": datetime(2024, 12, 1).isoformat(),
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Café français 🇫🇷"
        assert data["category"] == "食物"

    def test_create_transaction_invalid_amount_type(self, client: TestClient):
        """Test transaction creation with invalid amount type"""
        transaction_data = {
            "type": "expense",
            "amount": "not_a_number",
            "description": "Coffee",
            "category": "food",
            "date": datetime(2024, 12, 1).isoformat(),
        }

        response = client.post("/api/v1/transactions", json=transaction_data)
        assert response.status_code == 422  # Validation error for invalid amount type

    def test_get_all_transactions_success(self, client: TestClient, db_session):
        """Test successful retrieval of all transactions"""
        # Create test transactions
        test_transactions = [
            Transaction(
                type=TransactionType.income,
                amount=1000,
                description="Salary",
                category="salary",
                date=datetime(2024, 12, 1),
                created_at=datetime.now(),
            ),
            Transaction(
                type=TransactionType.expense,
                amount=500,
                description="Groceries",
                category="food",
                date=datetime(2024, 12, 2),
                created_at=datetime.now(),
            ),
            Transaction(
                type=TransactionType.income,
                amount=2000,
                description="Freelance",
                category="work",
                date=datetime(2024, 12, 3),
                created_at=datetime.now(),
            ),
        ]

        for transaction in test_transactions:
            db_session.add(transaction)
        db_session.commit()

        response = client.get("/api/v1/transactions")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_get_transactions_no_transactions(self, client: TestClient):
        """Test retrieval when no transactions exist"""
        response = client.get("/api/v1/transactions")

        assert response.status_code == 404

    def test_delete_transaction_success(self, client: TestClient, db_session):
        """Test successful transaction deletion"""
        # Create a test transaction
        test_transaction = Transaction(
            type=TransactionType.expense,
            amount=250,
            description="Coffee",
            category="food",
            date=datetime(2024, 12, 1),
            created_at=datetime.now(),
        )

        db_session.add(test_transaction)
        db_session.commit()
        db_session.refresh(test_transaction)

        transaction_id = test_transaction.id

        response = client.delete(f"/api/v1/transactions/{transaction_id}")

        assert response.status_code == 200
        assert response.json()["detail"] == "Transaction deleted successfully"

        # Verify transaction is deleted
        deleted_transaction = (
            db_session.query(Transaction)
            .filter(Transaction.id == transaction_id)
            .first()
        )
        assert deleted_transaction is None

    def test_delete_transaction_not_found(self, client: TestClient):
        """Test deletion of non-existent transaction"""
        response = client.delete("/api/v1/transactions/999")

        assert response.status_code == 404

    def test_delete_transaction_invalid_id(self, client: TestClient):
        """Test deletion with invalid transaction ID"""
        response = client.delete("/api/v1/transactions/invalid")

        assert response.status_code == 422  # Validation error

    def test_create_multiple_transactions(self, client: TestClient):
        """Test creating multiple transactions"""
        transactions_data = [
            {
                "type": "income",
                "amount": 1000,
                "description": "Salary",
                "category": "salary",
                "date": "2024-12-01T00:00:00",
            },
            {
                "type": "expense",
                "amount": 300,
                "description": "Rent",
                "category": "housing",
                "date": "2024-12-02T00:00:00",
            },
        ]

        created_transactions = []
        for transaction_data in transactions_data:
            response = client.post("/api/v1/transactions", json=transaction_data)
            assert response.status_code == 200
            created_transactions.append(response.json())

        # Verify all transactions are retrieved
        response = client.get("/api/v1/transactions")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2

    def test_transaction_amount_edge_cases(self, client: TestClient):
        """Test transaction creation with edge case amounts"""
        edge_cases = [
            {"amount": 0, "expected_status": 200},  # Zero amount
            {"amount": 1, "expected_status": 200},  # Minimum positive
            {"amount": 999999999999, "expected_status": 200},  # Very large amount (BigInteger supports this)
            {"amount": -999999999999, "expected_status": 200},  # Very large negative amount
        ]

        for case in edge_cases:
            transaction_data = {
                "type": "expense",
                "amount": case["amount"],
                "description": f"Test amount {case['amount']}",
                "category": "test",
                "date": "2024-12-01T00:00:00",
            }

            response = client.post("/api/v1/transactions", json=transaction_data)
            assert response.status_code == case["expected_status"]
            if response.status_code == 200:
                assert response.json()["amount"] == case["amount"]

    def test_transaction_date_formats(self, client: TestClient):
        """Test transaction creation with different date formats"""
        valid_dates = [
            "2024-12-01T00:00:00",
            "2024-12-01T12:30:45",
            "2024-01-15T23:59:59",
        ]

        for date_str in valid_dates:
            transaction_data = {
                "type": "income",
                "amount": 100,
                "description": f"Test date {date_str}",
                "category": "test",
                "date": date_str,
            }

            response = client.post("/api/v1/transactions", json=transaction_data)
            assert response.status_code == 200
