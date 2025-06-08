import datetime
import os
from decimal import Decimal
from typing import Any, Dict, List

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

_current_dir = os.path.dirname(os.path.abspath(__file__))
_env_path = os.path.join(_current_dir, "..", ".env")
load_dotenv(_env_path)


def convert_to_json_serializable(value):
    """Convert non-JSON serializable types to JSON serializable ones"""
    if isinstance(value, Decimal):
        return float(value)
    elif isinstance(value, (datetime.date, datetime.datetime)):
        return value.isoformat()
    elif isinstance(value, datetime.time):
        return value.isoformat()
    else:
        return value


def execute_sql_query(sql_query: str) -> List[Dict[str, Any]]:
    """
    Execute a SQL query against the PostgreSQL database.

    Args:
        sql_query (str): The SQL query to execute
        params (tuple, optional): Parameters for the SQL query to prevent SQL injection

    Returns:
        List[Dict[str, Any]]: Query results as a list of dictionaries or error message
    """
    if not sql_query or not sql_query.strip():
        return [{"error": "SQL query cannot be empty"}]

    # Check if query contains 'transactions_table'
    if "transactions_table" not in sql_query.lower():
        return [{"error": "Query must reference 'transactions_table'"}]

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return [{"error": "DATABASE_URL environment variable is not set"}]

    try:
        with psycopg2.connect(database_url, cursor_factory=RealDictCursor) as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql_query)

                if sql_query.strip().upper().startswith("SELECT"):
                    results = cursor.fetchall()
                    clean_results = []
                    for row in results:
                        clean_row = {}
                        for key, value in row.items():
                            clean_row[key] = convert_to_json_serializable(value)
                        clean_results.append(clean_row)
                    return clean_results

                else:
                    conn.commit()
                    return [{"success": True, "affected_rows": cursor.rowcount}]

    except psycopg2.Error as e:
        return [{"error": f"Database error: {str(e)}"}]
    except Exception as e:
        return [{"error": f"Unexpected error: {str(e)}"}]


def get_balance() -> Dict[str, Any]:
    """
    Get the balance by summing all income and expenses.

    Returns:
        Dict[str, Any]: A dictionary containing the balance information
    """
    sql_query = """
    SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
    FROM transactions_table;
    """

    result = execute_sql_query(sql_query)

    if "error" in result[0]:
        return result[0]

    total_income = result[0].get("total_income", 0)
    total_expense = result[0].get("total_expense", 0)

    balance = total_income - total_expense

    return {
        "balance": balance,
        "total_income": total_income,
        "total_expense": total_expense,
    }
