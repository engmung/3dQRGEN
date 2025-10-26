from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# SQLite 엔진 생성
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # SQLite용 설정
    echo=settings.database_echo  # SQL 쿼리 로깅 (환경변수로 제어)
)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 (모든 모델의 부모)
Base = declarative_base()


def get_db():
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """데이터베이스 테이블 생성 및 초기 데이터 설정"""
    # 모든 모델 import (테이블 생성 전에 필요)
    from app.models.pricing import PricingSetting
    from app.models.product import Product
    from app.models.order_group import OrderGroup
    from app.models.order_line_item import OrderLineItem
    from app.models.order import Order  # 기존 Order 모델도 유지

    # 테이블 생성
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. 가격 설정 초기화
        existing_setting = db.query(PricingSetting).first()
        if not existing_setting:
            default_pricing = PricingSetting(
                base_price=20000.0,
                text_price=5000.0,
                image_price=5000.0
            )
            db.add(default_pricing)
            db.commit()
            print("✅ 기본 가격 설정 생성 완료")

        # 2. 제품(거치대) 초기 데이터 삽입
        existing_products = db.query(Product).count()
        if existing_products == 0:
            products = [
                Product(
                    sku="QR-PLATE-BASE",
                    name="QR 판 (기본)",
                    description="3D QR 코드 판 기본 모델",
                    category="qr_plate",
                    base_price=20000.0
                ),
                Product(
                    sku="STAND-0DEG",
                    name="거치대 (평평 0°)",
                    description="0도 각도의 평평한 거치대",
                    category="stand",
                    base_price=0.0
                ),
                Product(
                    sku="STAND-30DEG",
                    name="거치대 (30°)",
                    description="30도 경사 거치대",
                    category="stand",
                    base_price=0.0
                ),
                Product(
                    sku="STAND-45DEG",
                    name="거치대 (45°)",
                    description="45도 경사 거치대 (기본 권장)",
                    category="stand",
                    base_price=0.0
                ),
                Product(
                    sku="STAND-60DEG",
                    name="거치대 (60°)",
                    description="60도 경사 거치대",
                    category="stand",
                    base_price=0.0
                ),
                Product(
                    sku="STAND-90DEG",
                    name="거치대 (수직 90°)",
                    description="90도 수직 거치대",
                    category="stand",
                    base_price=0.0
                ),
            ]
            db.add_all(products)
            db.commit()
            print(f"✅ 제품 초기 데이터 생성 완료 ({len(products)}개)")
    finally:
        db.close()
