"""Application-wide constants"""


class OrderStatus:
    """Order status constants"""
    PENDING = "pending"                      # 입금 대기
    PAID = "paid"                            # 입금 완료 / 제작 대기
    IN_PRODUCTION = "in_production"          # 제작 중
    SHIPPED = "shipped"                      # 배송 중
    COMPLETED = "completed"                  # 배송 완료
    FAILED = "failed"                        # 취소됨

    @classmethod
    def all(cls) -> list[str]:
        """Return all valid statuses"""
        return [
            cls.PENDING,
            cls.PAID,
            cls.IN_PRODUCTION,
            cls.SHIPPED,
            cls.COMPLETED,
            cls.FAILED
        ]

    @classmethod
    def validate(cls, status: str) -> bool:
        """Check if status is valid"""
        return status in cls.all()


# Pricing constants
PRICE_TOLERANCE = 1.0  # 가격 검증 허용 오차 (원)

# Production schedule constants
DEFAULT_PRODUCTION_DAYS = 60  # 기본 생산 일정 생성 일수
