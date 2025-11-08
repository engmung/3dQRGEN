"""Pricing calculation service - consolidates duplicate logic from routers"""
from app.models.pricing import PricingSetting
from sqlalchemy.orm import Session
from fastapi import HTTPException


def calculate_product_price(customization_data: dict, pricing: PricingSetting, product_type: str = "stand") -> float:
    """
    Calculate product price based on customization and product type.

    Consolidates duplicate logic from:
    - routers/orders.py calculate_expected_price() (Lines 21-44)
    - routers/order_groups.py calculate_line_item_price() (Lines 29-52)

    Args:
        customization_data: 판 설정 데이터 (text, images 포함)
        pricing: 현재 가격 설정
        product_type: "stand" (거치대) or "card" (명함)

    Returns:
        계산된 가격
    """
    # Select base price based on product type
    if product_type == "card":
        price = pricing.card_base_price
    else:
        price = pricing.base_price

    # Add text price if text content exists
    text_content = customization_data.get('text', '')
    if text_content and text_content.strip():
        price += pricing.text_price

    # Add image price for each image
    images = customization_data.get('images', [])
    if images and len(images) > 0:
        price += pricing.image_price * len(images)

    return price


def get_pricing_settings(db: Session, create_if_missing: bool = False) -> PricingSetting:
    """
    Get pricing settings from database.

    Consolidates duplicate logic from:
    - routers/orders.py (Lines 100-102)
    - routers/order_groups.py (Lines 156-158)
    - routers/pricing.py (Lines 33-44)

    Args:
        db: Database session
        create_if_missing: Create default settings if none exist

    Returns:
        PricingSetting instance

    Raises:
        HTTPException: If settings not found and create_if_missing=False
    """
    setting = db.query(PricingSetting).first()

    if not setting:
        if create_if_missing:
            setting = PricingSetting(
                base_price=20000.0,
                card_base_price=10000.0,
                text_price=5000.0,
                image_price=5000.0
            )
            db.add(setting)
            db.commit()
            db.refresh(setting)
        else:
            raise HTTPException(status_code=500, detail="Pricing settings not found")

    return setting


def validate_price(received_price: float, expected_price: float, tolerance: float = 1.0) -> bool:
    """
    Validate that received price matches expected price within tolerance.

    Args:
        received_price: Price sent from client
        expected_price: Calculated expected price
        tolerance: Allowed difference (default 1원)

    Returns:
        True if valid, False otherwise
    """
    return abs(received_price - expected_price) <= tolerance
