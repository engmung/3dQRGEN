from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
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
    stand_id = Column(Integer)  # 외래키 제거, 단순 정수
    stand_name = Column(String(100))  # 거치대 이름 추가

    # QR & Customization
    qr_url = Column(String(500), nullable=False)
    customization = Column(JSON)  # {plate_width, plate_height, plate_depth, qr_size, qr_depth, qr_y_offset}

    # Customer Info
    user_id = Column(String(255), index=True)  # Clerk User ID
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(100))
    customer_phone = Column(String(20))  # 전화번호
    customer_postal_code = Column(String(10))  # 우편번호
    customer_address = Column(Text)  # 상세 주소
    delivery_message = Column(Text)  # 배송 메시지 (공동현관 비밀번호 등)

    # Payment & Status
    status = Column(String(20), default="pending")  # pending, paid, completed, failed
    payment_id = Column(String(100))  # Lemon Squeezy order ID
    price = Column(Float, default=0.0)  # 주문 가격 (원)

    # Download
    download_token = Column(String(255))
    stl_file_path = Column(String(255))

    # Timestamps
    created_at = Column(DateTime, default=get_kst_now)
    updated_at = Column(DateTime, default=get_kst_now, onupdate=get_kst_now)

    def __repr__(self):
        return f"<Order(id={self.id}, order_uuid='{self.order_uuid}', status='{self.status}')>"
