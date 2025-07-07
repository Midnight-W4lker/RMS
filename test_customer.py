#!/usr/bin/env python3
"""
Test Customer Creation - Verify the IntegrityError fix
"""

import sys
import os

sys.path.insert(0, os.getcwd())

from app import app
from models import db, Customer


def test_customer_creation():
    with app.app_context():
        print("🧪 Testing customer creation...")

        # Test creating a customer without providing customer_id
        try:
            new_customer = Customer(name="Test Customer", email="test@example.com")
            db.session.add(new_customer)
            db.session.commit()

            print(f"✅ Customer created successfully!")
            print(f"   ID: {new_customer.customer_id}")
            print(f"   Name: {new_customer.name}")
            print(f"   Email: {new_customer.email}")

            # Clean up test data
            db.session.delete(new_customer)
            db.session.commit()
            print("🧹 Test data cleaned up")

        except Exception as e:
            print(f"❌ Customer creation failed: {e}")
            db.session.rollback()


if __name__ == "__main__":
    test_customer_creation()
