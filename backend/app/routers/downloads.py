from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order
from app.services import storage
import os

router = APIRouter()


@router.get("/{order_uuid}")
async def download_stl(
    order_uuid: str,
    db: Session = Depends(get_db)
):
    """
    STL 파일 다운로드 (토큰 검증 없음 - 임시)

    1. 주문 조회
    2. STL 파일 제공
    """
    # 1. 주문 조회
    order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 2. 파일 경로 확인
    file_path = storage.get_order_stl_path(order_uuid)
    if not storage.check_file_exists(file_path):
        raise HTTPException(status_code=404, detail="STL file not found")

    # 3. 파일 전송
    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=f"qr_plate_{order_uuid}.stl"
    )
