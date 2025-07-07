#!/usr/bin/env python3

import sys
import os

sys.path.insert(0, os.getcwd())

from app import app
from models import db


def check_schema():
    with app.app_context():
        from sqlalchemy import inspect

        inspector = inspect(db.engine)
        tables = inspector.get_table_names()

        print("Current database schema:")
        for table in tables:
            print(f"\nTable: {table}")
            columns = inspector.get_columns(table)
            for col in columns:
                col_name = col["name"]
                col_type = str(col["type"])
                nullable = col["nullable"]
                primary_key = col.get("primary_key", False)
                print(
                    f"  {col_name:20} {col_type:15} nullable={nullable} pk={primary_key}"
                )


if __name__ == "__main__":
    check_schema()
