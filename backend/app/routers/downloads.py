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
    OBJ+MTL 파일 다운로드 (ZIP 형식)

    1. 주문 조회
    2. 2개 파일을 ZIP으로 압축하여 제공 ({user_id}_{timestamp}.obj/mtl)
    """
    # 1. 주문 조회
    order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 2. 파일 경로 설정
    order_dir = os.path.join(settings.storage_path, order_uuid)

    # 3. 디렉토리에서 obj/mtl 파일 찾기
    obj_file = None
    mtl_file = None

    if os.path.exists(order_dir):
        for filename in os.listdir(order_dir):
            if filename.endswith('.obj'):
                obj_file = filename
            elif filename.endswith('.mtl'):
                mtl_file = filename

    if not obj_file or not mtl_file:
        raise HTTPException(status_code=404, detail="Model files not found")

    obj_path = os.path.join(order_dir, obj_file)
    mtl_path = os.path.join(order_dir, mtl_file)

    # 4. ZIP 파일 생성 (메모리)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.write(obj_path, obj_file)  # 원본 파일명 유지
        zip_file.write(mtl_path, mtl_file)  # 원본 파일명 유지

    # 5. ZIP 파일 전송
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=3d_model_{order_uuid}.zip"}
    )
