"""
Color system migration script
Migrates from separate plate/qr colors to unified color system with allowed combinations

Usage:
cd backend
python scripts/migrate_color_system.py
"""

import sys
import os

# Add parent directory to import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine
from app.models.pricing import PricingSetting
from sqlalchemy import text

def migrate():
    """Migrate color system"""

    print("Starting color system migration...")

    # Step 1: Add new columns
    with engine.connect() as conn:
        try:
            # Add available_colors column
            conn.execute(text("""
                ALTER TABLE pricing_settings
                ADD COLUMN available_colors TEXT
                DEFAULT '[{"name":"black","value":"#000000"},{"name":"white","value":"#FFFFFF"},{"name":"pink","value":"#FF69B4"}]'
            """))
            print("added available_colors column")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("available_colors column already exists")
            else:
                print(f"failed to add available_colors: {e}")

        try:
            # Add allowed_combinations column
            conn.execute(text("""
                ALTER TABLE pricing_settings
                ADD COLUMN allowed_combinations TEXT
                DEFAULT '[{"plate":"#FFFFFF","qr":"#000000"},{"plate":"#000000","qr":"#FFFFFF"},{"plate":"#FF69B4","qr":"#000000"}]'
            """))
            print("added allowed_combinations column")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("allowed_combinations column already exists")
            else:
                print(f"failed to add allowed_combinations: {e}")

        conn.commit()

    # Step 2: Migrate existing data
    db = SessionLocal()
    try:
        setting = db.query(PricingSetting).first()

        if setting:
            updated = False

            # Set default values if not set
            if not hasattr(setting, 'available_colors') or not setting.available_colors:
                setting.available_colors = '[{"name":"black","value":"#000000"},{"name":"white","value":"#FFFFFF"},{"name":"pink","value":"#FF69B4"}]'
                updated = True

            if not hasattr(setting, 'allowed_combinations') or not setting.allowed_combinations:
                setting.allowed_combinations = '[{"plate":"#FFFFFF","qr":"#000000"},{"plate":"#000000","qr":"#FFFFFF"},{"plate":"#FF69B4","qr":"#000000"}]'
                updated = True

            # Update warning message
            if hasattr(setting, 'color_warning_message'):
                setting.color_warning_message = 'selected color combination may have low QR readability. will be converted to closest allowed combination on order.'
                updated = True

            if updated:
                db.commit()
                print("migrated existing data")
            else:
                print("existing data already migrated")
        else:
            print("no pricing setting record found (will be created on app startup)")

    finally:
        db.close()

    print("\nmigration completed!")
    print("\nnext steps:")
    print("1. restart FastAPI server: uvicorn app.main:app --reload")
    print("2. click 'edit pricing' in admin page")
    print("3. verify color system settings")


if __name__ == "__main__":
    migrate()
