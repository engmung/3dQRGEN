from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from app.database import Base
import uuid

# 한국 시간대 (KST = UTC+9)
KST = timezone(timedelta(hours=9))

def get_kst_now():
    """현재 한국 시간을 반환합니다 (timezone 정보 제거)."""
    # SQLite는 naive datetime을 사용하므로 timezone 정보를 제거
    return datetime.now(KST).replace(tzinfo=None)


class Order(Base):
    """주문 모델"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    stand_id = Column(Integer, ForeignKey("stands.id"))

    # QR & Customization
    qr_url = Column(String(500), nullable=False)
    customization = Column(JSON)  # {plate_width, plate_height, plate_depth, qr_size, qr_depth, qr_y_offset}

    # Customer Info
    user_id = Column(String(255), index=True)  # Clerk User ID
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(100))
    customer_address = Column(Text)

    # Payment & Status
    status = Column(String(20), default="pending")  # pending, paid, completed, failed
    payment_id = Column(String(100))  # Lemon Squeezy order ID

    # Download
    download_token = Column(String(255))
    stl_file_path = Column(String(255))

    # Timestamps
    created_at = Column(DateTime, default=get_kst_now)
    updated_at = Column(DateTime, default=get_kst_now, onupdate=get_kst_now)

    # Relationships
    stand = relationship("Stand", back_populates="orders")

    def __repr__(self):
        return f"<Order(id={self.id}, order_uuid='{self.order_uuid}', status='{self.status}')>"
