from sqlalchemy import Column, Integer, Float, DateTime, Text
from app.database import Base
from app.utils.datetime_utils import get_kst_now


class PricingSetting(Base):
    """가격 설정 모델 (Singleton)"""
    __tablename__ = "pricing_settings"

    id = Column(Integer, primary_key=True, index=True)

    # 가격 설정
    base_price = Column(Float, default=20000.0, nullable=False)  # 기본 가격
    text_price = Column(Float, default=5000.0, nullable=False)   # 텍스트 추가 가격
    image_price = Column(Float, default=5000.0, nullable=False)  # 이미지 1개당 추가 가격

    # 공지사항
    announcement_message = Column(Text, nullable=True)  # 홈 화면 배너 공지사항

    # 색상 시스템 (JSON 문자열)
    available_colors = Column(
        Text,
        default='[{"name":"검정","value":"#000000"},{"name":"흰색","value":"#FFFFFF"},{"name":"핑크","value":"#FF69B4"}]',
        nullable=False
    )  # 출력 가능한 모든 색상 (판/QR 공통)

    allowed_combinations = Column(
        Text,
        default='[{"colors":["#FFFFFF","#000000"]},{"colors":["#FF69B4","#000000"]}]',
        nullable=False
    )  # 허용된 색상 조합 (QR 인식 가능, 순서 무관)

    color_warning_message = Column(
        Text,
        default='선택하신 색상 조합은 QR 인식이 어려울 수 있습니다. 주문 시 가장 유사한 허용 조합으로 변환됩니다.',
        nullable=False
    )  # 색상 경고 메시지

    # 타임스탬프
    updated_at = Column(DateTime, default=get_kst_now, onupdate=get_kst_now)

    def __repr__(self):
        return f"<PricingSetting(base={self.base_price}, text={self.text_price}, image={self.image_price})>"
