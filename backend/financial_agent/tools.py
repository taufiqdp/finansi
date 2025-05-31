import datetime
import os
from contextlib import contextmanager
from decimal import Decimal
from typing import Any, Dict, List, Optional

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
        List[Dict[str, Any]]: Query results as a list of dictionaries

    Raises:
        psycopg2.Error: If there's a database connection or query error
        ValueError: If the query is invalid or empty
    """
    if not sql_query or not sql_query.strip():
        raise ValueError("SQL query cannot be empty")

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")

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
        raise psycopg2.Error(f"Database error: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error: {str(e)}")


@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Automatically handles connection cleanup.
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")

    conn = None
    try:
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        yield conn
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        raise psycopg2.Error(f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    # Example usage
    try:
        result = execute_sql_query(
            "SELECT AVG(amount) FROM transactions_table WHERE type = 'income';"
        )
        print(result)
    except Exception as e:
        print(f"Error: {str(e)}")
