from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional


class LineItemCustomization(BaseModel):
    """Line Item의 Customization 데이터"""
    plate_width: Optional[float] = 100.0
    plate_height: Optional[float] = 100.0
    plate_depth: Optional[float] = 5.0
    qr_size: float
    qr_depth: float
    qr_y_offset: float
    text: Optional[str] = None
    images: Optional[List[dict]] = []  # ImageConfig 배열 (File 제외)
    # 기타 모든 QRPlateConfig 필드 포함 가능


class LineItemCreate(BaseModel):
    """주문 라인 아이템 생성 스키마"""
    product_sku: str  # 'QR-PLATE-BASE'
    stand_sku: Optional[str] = None  # 'STAND-45DEG'
    qr_url: str
    customization: LineItemCustomization
    quantity: int = 1


class LineItemResponse(BaseModel):
    """주문 라인 아이템 응답 스키마"""
    id: int
    line_item_uuid: str
    product_sku: str
    stand_sku: Optional[str] = None
    qr_url: str
    customization: dict
    quantity: int
    unit_price: float
    total_price: float
    obj_file_path: Optional[str] = None
    mtl_file_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerInfo(BaseModel):
    """고객 정보"""
    email: EmailStr
    name: str
    phone: str
    postal_code: str
    address: str
    delivery_message: Optional[str] = ""


class OrderGroupCreate(BaseModel):
    """주문 그룹 생성 스키마"""
    customer: CustomerInfo
    # line_items는 multipart로 별도 전송 (파일 포함)


class OrderGroupResponse(BaseModel):
    """주문 그룹 응답 스키마"""
    id: int
    group_uuid: str
    user_id: Optional[str] = None
    customer_email: str
    customer_name: str
    customer_phone: str
    customer_postal_code: str
    customer_address: str
    delivery_message: Optional[str] = None
    status: str
    payment_id: Optional[str] = None
    total_price: float
    created_at: datetime
    updated_at: datetime
    line_items: List[LineItemResponse] = []

    class Config:
        from_attributes = True


class OrderGroupCreateResponse(BaseModel):
    """주문 그룹 생성 성공 응답"""
    group_uuid: str
    total_price: float
    line_item_count: int
    message: str
