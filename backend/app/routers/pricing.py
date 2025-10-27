from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.pricing import PricingSetting
from app.services.pricing_service import get_pricing_settings as get_pricing_service
from app.auth import get_admin_user

router = APIRouter(prefix="/api/pricing", tags=["pricing"])


class PricingSettingResponse(BaseModel):
    """가격 설정 응답 스키마"""
    base_price: float
    text_price: float
    image_price: float
    announcement_message: str | None = None
    available_colors: str
    allowed_combinations: str
    color_warning_message: str

    class Config:
        from_attributes = True


class PricingSettingUpdate(BaseModel):
    """가격 설정 업데이트 스키마"""
    base_price: float
    text_price: float
    image_price: float
    announcement_message: str | None = None
    available_colors: str | None = None
    allowed_combinations: str | None = None
    color_warning_message: str | None = None


@router.get("", response_model=PricingSettingResponse)
def get_pricing(db: Session = Depends(get_db)):
    """
    현재 가격 설정 조회 (인증 불필요)
    """
    setting = get_pricing_service(db, create_if_missing=True)
    return setting


@router.put("", response_model=PricingSettingResponse)
def update_pricing_settings(
    pricing_update: PricingSettingUpdate,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    가격 설정 업데이트 (관리자만)
    """

    # 기존 설정 가져오기
    setting = db.query(PricingSetting).first()

    if not setting:
        # 없으면 새로 생성
        setting = PricingSetting(
            base_price=pricing_update.base_price,
            text_price=pricing_update.text_price,
            image_price=pricing_update.image_price,
            announcement_message=pricing_update.announcement_message,
            available_colors=pricing_update.available_colors,
            allowed_combinations=pricing_update.allowed_combinations,
            color_warning_message=pricing_update.color_warning_message
        )
        db.add(setting)
    else:
        # 있으면 업데이트
        setting.base_price = pricing_update.base_price
        setting.text_price = pricing_update.text_price
        setting.image_price = pricing_update.image_price
        setting.announcement_message = pricing_update.announcement_message

        # 색상 필드는 제공된 경우에만 업데이트
        if pricing_update.available_colors is not None:
            setting.available_colors = pricing_update.available_colors
        if pricing_update.allowed_combinations is not None:
            setting.allowed_combinations = pricing_update.allowed_combinations
        if pricing_update.color_warning_message is not None:
            setting.color_warning_message = pricing_update.color_warning_message

    db.commit()
    db.refresh(setting)

    return setting
