from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from app.database import Base
import uuid

# 한국 시간대 (KST = UTC+9)
KST = timezone(timedelta(hours=9))


def get_kst_now():
    """현재 한국 시간을 반환합니다 (timezone 정보 제거)."""
    return datetime.now(KST).replace(tzinfo=None)


class OrderLineItem(Base):
    """
    주문 라인 아이템 모델
    OrderGroup 내의 개별 제품 주문
    """
    __tablename__ = "order_line_items"

    id = Column(Integer, primary_key=True, index=True)
    line_item_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    order_group_id = Column(Integer, ForeignKey('order_groups.id', ondelete='CASCADE'), nullable=False, index=True)

    # Product Info
    product_sku = Column(String(50), nullable=False)  # 'QR-PLATE-BASE'
    stand_sku = Column(String(50))  # 'STAND-45DEG', 'STAND-0DEG', etc.

    # QR Data
    qr_url = Column(String(500), nullable=False)
    customization = Column(JSON)  # {qr_size, qr_depth, text, images, colors, etc.}

    # Pricing
    quantity = Column(Integer, nullable=False, default=1)  # 🔥 진짜 수량!
    unit_price = Column(Float, nullable=False)  # 개당 가격
    total_price = Column(Float, nullable=False)  # unit_price * quantity

    # Files
    obj_file_path = Column(String(255))  # /storage/order_groups/{group_uuid}/{line_item_uuid}/model.obj
    mtl_file_path = Column(String(255))  # /storage/order_groups/{group_uuid}/{line_item_uuid}/model.mtl

    # Timestamps
    created_at = Column(DateTime, default=get_kst_now)

    # Relationships
    order_group = relationship("OrderGroup", back_populates="line_items")

    def __repr__(self):
        return f"<OrderLineItem(line_item_uuid='{self.line_item_uuid}', sku='{self.product_sku}', qty={self.quantity}, price={self.total_price})>"
