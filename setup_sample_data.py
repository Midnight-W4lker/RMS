#!/usr/bin/env python3
"""
Quick Database Setup Script
Adds sample products and customers if they don't exist
"""

from app import app, db
from models import Product, Customer
from datetime import datetime


def setup_sample_data():
    with app.app_context():
        print("🔍 Checking database content...")

        # Check existing products
        existing_products = Product.query.all()
        print(f"Found {len(existing_products)} existing products")

        # Check existing customers
        existing_customers = Customer.query.all()
        print(f"Found {len(existing_customers)} existing customers")

        # Add sample products if none exist
        if len(existing_products) == 0:
            print("📦 Adding sample products...")
            sample_products = [
                Product(
                    product_id="P001",
                    name="Laptop",
                    description="High-performance laptop",
                    price=999.99,
                    stock_quantity=10,
                ),
                Product(
                    product_id="P002",
                    name="Mouse",
                    description="Wireless computer mouse",
                    price=29.99,
                    stock_quantity=50,
                ),
                Product(
                    product_id="P003",
                    name="Keyboard",
                    description="Mechanical keyboard",
                    price=79.99,
                    stock_quantity=25,
                ),
                Product(
                    product_id="P004",
                    name="Monitor",
                    description="24-inch LCD monitor",
                    price=199.99,
                    stock_quantity=15,
                ),
                Product(
                    product_id="P005",
                    name="Webcam",
                    description="HD webcam for video calls",
                    price=49.99,
                    stock_quantity=30,
                ),
            ]

            for product in sample_products:
                db.session.add(product)

            print(f"✅ Added {len(sample_products)} sample products")

        # Add sample customers if none exist
        if len(existing_customers) == 0:
            print("👥 Adding sample customers...")
            sample_customers = [
                Customer(name="John Doe", email="john.doe@example.com"),
                Customer(name="Jane Smith", email="jane.smith@example.com"),
                Customer(name="Bob Johnson", email="bob.johnson@example.com"),
                Customer(name="Alice Brown", email="alice.brown@example.com"),
                Customer(name="Charlie Wilson", email="charlie.wilson@example.com"),
            ]

            for customer in sample_customers:
                db.session.add(customer)

            print(f"✅ Added {len(sample_customers)} sample customers")

        # Commit changes
        try:
            db.session.commit()
            print("💾 Database updated successfully")

            # Display final counts
            total_products = Product.query.count()
            total_customers = Customer.query.count()
            print(f"📊 Final database state:")
            print(f"   - Products: {total_products}")
            print(f"   - Customers: {total_customers}")

            # List all products for verification
            print("\n📦 Available Products:")
            for product in Product.query.all():
                print(
                    f"   - {product.product_id}: {product.name} (${product.price}) - Stock: {product.stock_quantity}"
                )

        except Exception as e:
            print(f"❌ Error updating database: {e}")
            db.session.rollback()


if __name__ == "__main__":
    setup_sample_data()
