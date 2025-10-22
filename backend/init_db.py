"""데이터베이스 초기화 및 초기 데이터 생성 스크립트"""
import sys
import os

# 현재 디렉토리를 Python path에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db
from app.models.stand import Stand


def create_initial_stands():
    """초기 거치대 5개 생성"""
    db = SessionLocal()

    try:
        # 기존 거치대 확인
        existing_count = db.query(Stand).count()
        if existing_count > 0:
            print(f"[WARNING] Already {existing_count} stands in database. Skipping initialization.")
            return

        # 거치대 5개 생성 (판 너비 기준: 70mm, 75mm, 80mm, 85mm, 90mm)
        stands = [
            Stand(
                name="기본 거치대 (70mm)",
                description="70mm 너비의 판에 맞는 기본 거치대",
                thumbnail_url="/static/stands/1_thumbnail.png",
                preview_model_url="/static/stands/1_preview.stl",
                price=15000.0,
                is_active=True
            ),
            Stand(
                name="표준 거치대 (75mm)",
                description="75mm 너비의 판에 맞는 표준 거치대",
                thumbnail_url="/static/stands/2_thumbnail.png",
                preview_model_url="/static/stands/2_preview.stl",
                price=20000.0,
                is_active=True
            ),
            Stand(
                name="중형 거치대 (80mm)",
                description="80mm 너비의 판에 맞는 중형 거치대",
                thumbnail_url="/static/stands/3_thumbnail.png",
                preview_model_url="/static/stands/3_preview.stl",
                price=25000.0,
                is_active=True
            ),
            Stand(
                name="대형 거치대 (85mm)",
                description="85mm 너비의 판에 맞는 대형 거치대",
                thumbnail_url="/static/stands/4_thumbnail.png",
                preview_model_url="/static/stands/4_preview.stl",
                price=30000.0,
                is_active=True
            ),
            Stand(
                name="특대형 거치대 (90mm)",
                description="90mm 너비의 판에 맞는 특대형 거치대",
                thumbnail_url="/static/stands/5_thumbnail.png",
                preview_model_url="/static/stands/5_preview.stl",
                price=35000.0,
                is_active=True
            ),
        ]

        # DB에 추가
        db.add_all(stands)
        db.commit()

        print("[OK] Successfully created 5 initial stands:")
        for stand in stands:
            print(f"   - {stand.name}: {stand.price}won")

    except Exception as e:
        print(f"[ERROR] Error creating initial stands: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("[INFO] Initializing database...")
    init_db()
    print("[OK] Database tables created")

    print("\n[INFO] Creating initial data...")
    create_initial_stands()

    print("\n[OK] Database initialization complete!")
