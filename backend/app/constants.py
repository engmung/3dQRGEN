"""Application-wide constants"""


class OrderStatus:
    """Order status constants"""
    PENDING = "pending"
    PAID = "paid"
    COMPLETED = "completed"
    FAILED = "failed"

    @classmethod
    def all(cls) -> list[str]:
        """Return all valid statuses"""
        return [cls.PENDING, cls.PAID, cls.COMPLETED, cls.FAILED]

    @classmethod
    def validate(cls, status: str) -> bool:
        """Check if status is valid"""
        return status in cls.all()


# Pricing constants
PRICE_TOLERANCE = 1.0  # 가격 검증 허용 오차 (원)

# Production schedule constants
DEFAULT_PRODUCTION_DAYS = 60  # 기본 생산 일정 생성 일수
