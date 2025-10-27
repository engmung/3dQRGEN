from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Date
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.datetime_utils import get_kst_now
import uuid


class OrderGroup(Base):
    """
    주문 그룹 모델 (장바구니 단위)
    한 번의 "주문하기" 클릭 = 1개 OrderGroup
    """
    __tablename__ = "order_groups"

    id = Column(Integer, primary_key=True, index=True)
    group_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))

    # Customer Info
    user_id = Column(String(255), index=True)  # Clerk User ID
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(100))
    customer_phone = Column(String(20))
    customer_postal_code = Column(String(10))
    customer_address = Column(Text)
    delivery_message = Column(Text)

    # Production Schedule (DEPRECATED - LineItem별로 이동됨)
    production_date = Column(Date, nullable=True, index=False)  # 하위호환용 (사용 안 함)

    # Payment & Status
    status = Column(String(20), default="pending")  # pending, paid, processing, shipped, completed, cancelled
    payment_id = Column(String(100))
    total_price = Column(Float, default=0.0)  # 모든 line items 합계

    # Timestamps
    created_at = Column(DateTime, default=get_kst_now)
    updated_at = Column(DateTime, default=get_kst_now, onupdate=get_kst_now)

    # Relationships
    line_items = relationship("OrderLineItem", back_populates="order_group", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<OrderGroup(group_uuid='{self.group_uuid}', status='{self.status}', total_price={self.total_price})>"
