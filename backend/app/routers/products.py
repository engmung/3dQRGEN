from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.product import Product
from typing import List, Optional

router = APIRouter(prefix="/api/products", tags=["products"])


class ProductResponse(BaseModel):
    """제품 응답 스키마"""
    id: int
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    base_price: float

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    """제품 생성 스키마 (Admin용)"""
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    base_price: float = 0.0


@router.get("", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    제품 목록 조회 (인증 불필요)

    - category: 'stand', 'qr_plate' 등으로 필터링 가능
    """
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    products = query.all()
    return products


@router.get("/{sku}", response_model=ProductResponse)
def get_product_by_sku(sku: str, db: Session = Depends(get_db)):
    """
    SKU로 제품 조회 (인증 불필요)
    """
    product = db.query(Product).filter(Product.sku == sku).first()

    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU '{sku}' not found")

    return product


# Admin 전용 엔드포인트는 나중에 추가 가능 (POST, PUT, DELETE)
