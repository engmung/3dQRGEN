from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.database import Base
from app.utils.datetime_utils import get_kst_now


class Product(Base):
    """
    제품 모델 (거치대, QR 판 등)
    SKU 기반 제품 관리
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, nullable=False, index=True)  # 'STAND-45DEG', 'QR-PLATE-BASE'
    name = Column(String(100), nullable=False)  # '45도 거치대', 'QR 판 (기본)'
    description = Column(Text)  # 상세 설명
    category = Column(String(50))  # 'stand', 'qr_plate', 'accessory' 등
    base_price = Column(Float, default=0.0)  # 기본 가격 (옵션)

    # 메타데이터
    created_at = Column(DateTime, default=get_kst_now)
    updated_at = Column(DateTime, default=get_kst_now, onupdate=get_kst_now)

    def __repr__(self):
        return f"<Product(sku='{self.sku}', name='{self.name}', category='{self.category}')>"
