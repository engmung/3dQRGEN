"""
색상 팔레트 필드 마이그레이션 스크립트

실행 방법:
cd backend
python scripts/migrate_color_fields.py
"""

import sys
import os

# 상위 디렉토리를 import 경로에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine
from app.models.pricing import PricingSetting
from sqlalchemy import text

def migrate():
    """색상 팔레트 필드를 기존 DB에 추가"""

    print("🔧 색상 팔레트 필드 마이그레이션 시작...")

    # 1. 컬럼 추가
    with engine.connect() as conn:
        try:
            # available_plate_colors 추가
            conn.execute(text("""
                ALTER TABLE pricing_settings
                ADD COLUMN available_plate_colors TEXT
                DEFAULT '[{"name":"검정","value":"#000000"},{"name":"흰색","value":"#FFFFFF"},{"name":"핑크","value":"#FF69B4"}]'
            """))
            print("✅ available_plate_colors 컬럼 추가됨")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("⚠️  available_plate_colors 컬럼이 이미 존재합니다")
            else:
                print(f"❌ available_plate_colors 추가 실패: {e}")

        try:
            # available_qr_colors 추가
            conn.execute(text("""
                ALTER TABLE pricing_settings
                ADD COLUMN available_qr_colors TEXT
                DEFAULT '[{"name":"검정","value":"#000000"},{"name":"흰색","value":"#FFFFFF"}]'
            """))
            print("✅ available_qr_colors 컬럼 추가됨")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("⚠️  available_qr_colors 컬럼이 이미 존재합니다")
            else:
                print(f"❌ available_qr_colors 추가 실패: {e}")

        try:
            # recommended_combinations 추가
            conn.execute(text("""
                ALTER TABLE pricing_settings
                ADD COLUMN recommended_combinations TEXT
                DEFAULT '[{"plate":"#FFFFFF","qr":"#000000","reason":"QR 인식률 최고"},{"plate":"#000000","qr":"#FFFFFF","reason":"고급스러운 디자인"}]'
            """))
            print("✅ recommended_combinations 컬럼 추가됨")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("⚠️  recommended_combinations 컬럼이 이미 존재합니다")
            else:
                print(f"❌ recommended_combinations 추가 실패: {e}")

        try:
            # color_warning_message 추가
            conn.execute(text("""
                ALTER TABLE pricing_settings
                ADD COLUMN color_warning_message TEXT
                DEFAULT '선택하신 색상이 출력 가능한 색상이 아닙니다. 주문 시 가장 유사한 색상으로 출력됩니다.'
            """))
            print("✅ color_warning_message 컬럼 추가됨")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("⚠️  color_warning_message 컬럼이 이미 존재합니다")
            else:
                print(f"❌ color_warning_message 추가 실패: {e}")

        conn.commit()

    # 2. 기존 레코드에 기본값 설정
    db = SessionLocal()
    try:
        setting = db.query(PricingSetting).first()

        if setting:
            updated = False

            if not setting.available_plate_colors:
                setting.available_plate_colors = '[{"name":"검정","value":"#000000"},{"name":"흰색","value":"#FFFFFF"},{"name":"핑크","value":"#FF69B4"}]'
                updated = True

            if not setting.available_qr_colors:
                setting.available_qr_colors = '[{"name":"검정","value":"#000000"},{"name":"흰색","value":"#FFFFFF"}]'
                updated = True

            if not setting.recommended_combinations:
                setting.recommended_combinations = '[{"plate":"#FFFFFF","qr":"#000000","reason":"QR 인식률 최고"},{"plate":"#000000","qr":"#FFFFFF","reason":"고급스러운 디자인"}]'
                updated = True

            if not setting.color_warning_message:
                setting.color_warning_message = '선택하신 색상이 출력 가능한 색상이 아닙니다. 주문 시 가장 유사한 색상으로 출력됩니다.'
                updated = True

            if updated:
                db.commit()
                print("✅ 기존 레코드에 기본 색상 데이터 설정 완료")
            else:
                print("⚠️  기존 레코드에 이미 색상 데이터가 있습니다")
        else:
            print("⚠️  PricingSetting 레코드가 없습니다 (앱 시작 시 자동 생성됨)")

    finally:
        db.close()

    print("\n✨ 마이그레이션 완료!")
    print("\n📝 다음 단계:")
    print("1. FastAPI 서버 재시작: uvicorn app.main:app --reload")
    print("2. 관리자 페이지에서 '가격 설정 편집' 클릭")
    print("3. 색상 팔레트 확인 및 수정")


if __name__ == "__main__":
    migrate()
