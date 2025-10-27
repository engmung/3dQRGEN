"""
Migrate color combination structure from {plate, qr} to {colors: [color1, color2]}
Removes duplicates where A+B and B+A are the same combination

Usage:
cd backend
python scripts/migrate_combination_structure.py
"""

import sys
import os
import json

# Add parent directory to import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.pricing import PricingSetting


def migrate():
    """Migrate combination structure"""

    print("Starting combination structure migration...")
    print("Converting {plate, qr} to {colors: [color1, color2]}")

    db = SessionLocal()
    try:
        setting = db.query(PricingSetting).first()

        if not setting:
            print("No pricing setting found. Will be created with new structure on startup.")
            return

        # Load existing combinations
        try:
            old_combos = json.loads(setting.allowed_combinations)
        except:
            print("Failed to parse existing combinations. Using default.")
            old_combos = []

        print(f"\nFound {len(old_combos)} existing combinations:")
        for combo in old_combos:
            print(f"  - {combo}")

        # Convert to new structure
        new_combos = []
        seen_pairs = set()

        for combo in old_combos:
            # Handle old structure {plate, qr}
            if 'plate' in combo and 'qr' in combo:
                plate = combo['plate']
                qr = combo['qr']

                # Create normalized pair (order-independent)
                pair = frozenset([plate.upper(), qr.upper()])

                # Skip if already added (removes duplicates)
                if pair in seen_pairs:
                    print(f"  Skipping duplicate: {plate} + {qr}")
                    continue

                seen_pairs.add(pair)
                new_combos.append({
                    "colors": [plate, qr]
                })

            # Handle new structure {colors: [...]} (already migrated)
            elif 'colors' in combo:
                pair = frozenset([c.upper() for c in combo['colors']])
                if pair not in seen_pairs:
                    seen_pairs.add(pair)
                    new_combos.append(combo)

        print(f"\nConverted to {len(new_combos)} unique combinations:")
        for combo in new_combos:
            colors = combo['colors']
            print(f"  - {colors[0]} + {colors[1]} (order-independent)")

        # Update database
        setting.allowed_combinations = json.dumps(new_combos, ensure_ascii=False)
        db.commit()

        print("\nMigration completed successfully!")
        print("\nNext steps:")
        print("1. Restart backend server")
        print("2. Test color picker in frontend")
        print("3. Verify admin color combination editor")

    except Exception as e:
        print(f"\nError during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
