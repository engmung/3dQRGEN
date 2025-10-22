"""
데이터베이스 마이그레이션: orders 테이블에 user_id 컬럼 추가
"""
import sqlite3
import os

# 데이터베이스 파일 경로
DB_PATH = "./data/qr_platform.db"


def migrate():
    """user_id 컬럼을 orders 테이블에 추가합니다."""

    if not os.path.exists(DB_PATH):
        print("[ERROR] Database file not found:", DB_PATH)
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # user_id 컬럼이 이미 존재하는지 확인
        cursor.execute("PRAGMA table_info(orders)")
        columns = [column[1] for column in cursor.fetchall()]

        if "user_id" in columns:
            print("[INFO] Column 'user_id' already exists in 'orders' table. Skipping migration.")
        else:
            # user_id 컬럼 추가 (nullable)
            cursor.execute("ALTER TABLE orders ADD COLUMN user_id VARCHAR(255)")
            conn.commit()
            print("[OK] Successfully added 'user_id' column to 'orders' table")

            # 인덱스 추가
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)")
            conn.commit()
            print("[OK] Successfully created index on 'user_id' column")

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    print("[INFO] Starting database migration...")
    migrate()
    print("[INFO] Migration completed")
