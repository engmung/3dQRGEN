from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from app.database import Base


class PricingSetting(Base):
    """가격 설정 모델 (Singleton)"""
    __tablename__ = "pricing_settings"

    id = Column(Integer, primary_key=True, index=True)

    # 가격 설정
    base_price = Column(Float, default=20000.0, nullable=False)  # 기본 가격
    text_price = Column(Float, default=5000.0, nullable=False)   # 텍스트 추가 가격
    image_price = Column(Float, default=5000.0, nullable=False)  # 이미지 1개당 추가 가격

    # 타임스탬프
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<PricingSetting(base={self.base_price}, text={self.text_price}, image={self.image_price})>"
