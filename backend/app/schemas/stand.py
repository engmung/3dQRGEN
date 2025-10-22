from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StandBase(BaseModel):
    """거치대 기본 스키마"""
    name: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preview_model_url: Optional[str] = None
    price: float
    is_active: bool = True


class StandCreate(StandBase):
    """거치대 생성 스키마"""
    pass


class Stand(StandBase):
    """거치대 조회 스키마"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class StandResponse(BaseModel):
    """거치대 API 응답 스키마"""
    id: int
    name: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preview_model_url: Optional[str] = None
    price: float

    class Config:
        from_attributes = True
