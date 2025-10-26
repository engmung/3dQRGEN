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

    # 3. ZIP 파일 생성 (메모리)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Plate 파일 (필수)
        plate_obj_path = os.path.join(order_dir, "qr_plate.obj")
        plate_mtl_path = os.path.join(order_dir, "qr_plate.mtl")

        if not os.path.exists(plate_obj_path):
            raise HTTPException(status_code=404, detail="Plate OBJ file not found")
        if not os.path.exists(plate_mtl_path):
            raise HTTPException(status_code=404, detail="Plate MTL file not found")

        zip_file.write(plate_obj_path, "qr_plate.obj")
        zip_file.write(plate_mtl_path, "qr_plate.mtl")

        # Stand 파일 (선택적, 없으면 plate 파일 재사용)
        stand_obj_path = os.path.join(order_dir, "stand.obj")
        stand_mtl_path = os.path.join(order_dir, "stand.mtl")

        if os.path.exists(stand_obj_path):
            zip_file.write(stand_obj_path, "stand.obj")
        else:
            # Stand 파일이 없으면 plate 파일을 stand 이름으로 복사
            zip_file.write(plate_obj_path, "stand.obj")

        if os.path.exists(stand_mtl_path):
            zip_file.write(stand_mtl_path, "stand.mtl")
        else:
            # Stand 파일이 없으면 plate 파일을 stand 이름으로 복사
            zip_file.write(plate_mtl_path, "stand.mtl")

    # 4. ZIP 파일 전송
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=3d_model_{order_uuid}.zip"}
    )
