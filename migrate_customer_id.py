#!/usr/bin/env python3
"""
Database Migration Script: Fix Customer ID Auto-increment
This script safely migrates the customer_id from VARCHAR to INTEGER with auto-increment
"""

import sys
import os

sys.path.insert(0, os.getcwd())

from app import app
from models import db, Customer, Sale
from sqlalchemy import text


def migrate_customer_id():
    with app.app_context():
        print("🔄 Starting Customer ID migration...")

        # Step 1: Check if we have existing data
        customers = Customer.query.all()
        sales = Sale.query.all()

        print(f"📊 Found {len(customers)} customers and {len(sales)} sales")

        if customers or sales:
            print("⚠️  Database contains data. Creating backup migration...")

            # Create backup tables
            db.engine.execute(
                text(
                    """
                CREATE TABLE customer_backup AS SELECT * FROM customer;
            """
                )
            )

            db.engine.execute(
                text(
                    """
                CREATE TABLE sale_backup AS SELECT * FROM sale;
            """
                )
            )

            print("✅ Backup tables created")

            # Store customer mapping for migration
            customer_mapping = {}
            for i, customer in enumerate(customers, 1):
                customer_mapping[customer.customer_id] = i

            print(f"📝 Customer ID mapping created: {customer_mapping}")

        # Step 2: Drop foreign key constraints
        print("🔄 Dropping foreign key constraints...")
        try:
            db.engine.execute(text("PRAGMA foreign_keys=OFF;"))
        except:
            pass

        # Step 3: Create new tables with correct schema
        print("🔄 Creating new customer table...")
        db.engine.execute(
            text(
                """
            CREATE TABLE customer_new (
                customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
            )
        )

        db.engine.execute(
            text(
                """
            CREATE TABLE sale_new (
                sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id VARCHAR(100) NOT NULL,
                customer_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                total_price FLOAT NOT NULL,
                date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES product (product_id),
                FOREIGN KEY (customer_id) REFERENCES customer_new (customer_id)
            );
        """
            )
        )

        # Step 4: Migrate data if exists
        if customers:
            print("🔄 Migrating customer data...")
            for old_id, new_id in customer_mapping.items():
                customer = Customer.query.filter_by(customer_id=old_id).first()
                if customer:
                    db.engine.execute(
                        text(
                            """
                        INSERT INTO customer_new (customer_id, name, email)
                        VALUES (:new_id, :name, :email)
                    """
                        ),
                        {
                            "new_id": new_id,
                            "name": customer.name,
                            "email": customer.email,
                        },
                    )

            print("🔄 Migrating sales data...")
            for sale in sales:
                new_customer_id = customer_mapping.get(sale.customer_id)
                if new_customer_id:
                    db.engine.execute(
                        text(
                            """
                        INSERT INTO sale_new (product_id, customer_id, quantity, total_price, date)
                        VALUES (:product_id, :customer_id, :quantity, :total_price, :date)
                    """
                        ),
                        {
                            "product_id": sale.product_id,
                            "customer_id": new_customer_id,
                            "quantity": sale.quantity,
                            "total_price": sale.total_price,
                            "date": sale.date,
                        },
                    )

        # Step 5: Replace old tables
        print("🔄 Replacing old tables...")
        db.engine.execute(text("DROP TABLE customer;"))
        db.engine.execute(text("DROP TABLE sale;"))

        db.engine.execute(text("ALTER TABLE customer_new RENAME TO customer;"))
        db.engine.execute(text("ALTER TABLE sale_new RENAME TO sale;"))

        # Step 6: Re-enable foreign keys
        try:
            db.engine.execute(text("PRAGMA foreign_keys=ON;"))
        except:
            pass

        print("✅ Migration completed successfully!")
        print("🔄 Updating alembic version...")

        # Update alembic version
        db.engine.execute(
            text(
                """
            UPDATE alembic_version SET version_num = 'customer_id_migration_001';
        """
            )
        )

        print("✅ Database migration completed!")
        print("ℹ️  You can now run the application without the IntegrityError")


if __name__ == "__main__":
    try:
        migrate_customer_id()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("🔄 Restoring from backup...")
        try:
            with app.app_context():
                db.engine.execute(text("DROP TABLE IF EXISTS customer;"))
                db.engine.execute(text("DROP TABLE IF EXISTS sale;"))
                db.engine.execute(
                    text("ALTER TABLE customer_backup RENAME TO customer;")
                )
                db.engine.execute(text("ALTER TABLE sale_backup RENAME TO sale;"))
                print("✅ Restored from backup")
        except Exception as restore_error:
            print(f"❌ Restore failed: {restore_error}")
        sys.exit(1)
