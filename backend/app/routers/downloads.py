from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order
from app.config import settings
import os
import zipfile
import io

router = APIRouter()


@router.get("/{order_uuid}")
async def download_obj(
    order_uuid: str,
    db: Session = Depends(get_db)
):
    """
    OBJ+MTL 파일 다운로드 (ZIP 형식, 토큰 검증 없음 - 임시)

    1. 주문 조회
    2. 4개 파일을 ZIP으로 압축하여 제공
    """
    # 1. 주문 조회
    order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 2. 파일 경로 설정
    order_dir = os.path.join(settings.storage_path, order_uuid)
    files_to_zip = [
        ("qr_plate.obj", "qr_plate.obj"),
        ("qr_plate.mtl", "qr_plate.mtl"),
        ("stand.obj", "stand.obj"),
        ("stand.mtl", "stand.mtl"),
    ]

    # 3. ZIP 파일 생성 (메모리)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for filename, arcname in files_to_zip:
            file_path = os.path.join(order_dir, filename)
            if os.path.exists(file_path):
                zip_file.write(file_path, arcname)
            else:
                raise HTTPException(status_code=404, detail=f"File not found: {filename}")

    # 4. ZIP 파일 전송
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=3d_model_{order_uuid}.zip"}
    )
