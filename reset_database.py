#!/usr/bin/env python3
"""
Database Reset Utility
This script drops all tables and recreates them with the current model schema.
Useful for development when you need a fresh database.

Usage: python reset_database.py
"""

import sys
import os
sys.path.insert(0, os.getcwd())

from app import app
from models import db

def reset_database():
    """Reset the database by dropping and recreating all tables."""
    with app.app_context():
        print("🔄 Resetting database...")
        
        # Drop all tables
        print("🗑️  Dropping all tables...")
        db.drop_all()
        
        # Create all tables with current schema
        print("🏗️  Creating tables with current schema...")
        db.create_all()
        
        print("✅ Database reset completed!")
        print("� Next steps:")
        print("   - Run 'python seed_data.py' to add sample data")
        print("   - Or start the Flask app and add data through the UI")

if __name__ == "__main__":
    try:
        reset_database()
    except Exception as e:
        print(f"❌ Database reset failed: {e}")
        sys.exit(1)
