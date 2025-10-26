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
    Base.metadata.create_all(bind=engine)

    # 가격 설정 초기화
    from app.models.pricing import PricingSetting
    db = SessionLocal()
    try:
        # 가격 설정이 없으면 기본값 생성
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
    finally:
        db.close()
