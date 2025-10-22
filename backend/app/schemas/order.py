from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class Customization(BaseModel):
    """커스터마이징 설정 스키마"""
    plate_width: float  # mm
    plate_height: float  # mm
    plate_depth: float  # mm
    qr_size: float  # mm
    qr_depth: float  # mm
    qr_y_offset: float  # mm


class CustomerInfo(BaseModel):
    """고객 정보 스키마"""
    email: EmailStr
    name: str
    address: Optional[str] = None


class OrderBase(BaseModel):
    """주문 기본 스키마"""
    stand_id: int
    qr_url: str
    customization: Customization
    customer_email: EmailStr
    customer_name: str
    customer_address: Optional[str] = None


class OrderCreate(OrderBase):
    """주문 생성 스키마 (STL 파일은 multipart로 별도 전송)"""
    pass


class Order(OrderBase):
    """주문 조회 스키마"""
    id: int
    order_uuid: str
    status: str
    payment_id: Optional[str] = None
    download_token: Optional[str] = None
    stl_file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """주문 생성 API 응답 스키마"""
    order_uuid: str
    payment_url: str

    class Config:
        from_attributes = True
