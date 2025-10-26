from sqlalchemy import Column, Integer, Date, Boolean, DateTime
from sqlalchemy.orm import validates
from datetime import datetime, timezone, timedelta, date
from app.database import Base

# 한국 시간대 (KST = UTC+9)
KST = timezone(timedelta(hours=9))


def get_kst_now():
    """현재 한국 시간을 반환합니다 (timezone 정보 제거)."""
    return datetime.now(KST).replace(tzinfo=None)


class ProductionSchedule(Base):
    """
    생산 일정 모델
    날짜별 생산 가능량 및 예약 현황 관리
    """
    __tablename__ = "production_schedules"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True, nullable=False)  # 생산일
    max_capacity = Column(Integer, default=5, nullable=False)  # 최대 생산 가능 개수
    reserved_quantity = Column(Integer, default=0, nullable=False)  # 현재 예약된 개수
    is_available = Column(Boolean, default=True, nullable=False)  # 주문 가능 여부

    # Timestamps
    created_at = Column(DateTime, default=get_kst_now)
    updated_at = Column(DateTime, default=get_kst_now, onupdate=get_kst_now)

    @validates('reserved_quantity')
    def validate_reserved_quantity(self, key, value):
        """예약량이 음수가 되지 않도록 검증"""
        if value < 0:
            raise ValueError("Reserved quantity cannot be negative")
        return value

    @validates('max_capacity')
    def validate_max_capacity(self, key, value):
        """최대 생산량이 0 이상인지 검증"""
        if value < 0:
            raise ValueError("Max capacity must be non-negative")
        return value

    @property
    def available_slots(self):
        """남은 슬롯 수"""
        if not self.is_available:
            return 0
        return max(0, self.max_capacity - self.reserved_quantity)

    @property
    def is_full(self):
        """예약 마감 여부"""
        return not self.is_available or self.reserved_quantity >= self.max_capacity

    def __repr__(self):
        return f"<ProductionSchedule(date='{self.date}', reserved={self.reserved_quantity}/{self.max_capacity}, available={self.is_available})>"
