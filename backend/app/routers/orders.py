from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order
from app.schemas.order import OrderResponse
from app.services import storage
from app.services.telegram import send_order_notification
from app.config import settings
from app.auth import get_current_user_id, get_current_user_email, get_admin_user
import json
import uuid
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def serialize_order(order) -> dict:
    """주문 객체를 API 응답 딕셔너리로 변환"""
    return {
        "id": order.id,
        "order_uuid": order.order_uuid,
        "stand_id": order.stand_id,
        "stand_name": order.stand_name,
        "qr_url": order.qr_url,
        "customer_email": order.customer_email,
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "customer_postal_code": order.customer_postal_code,
        "customer_address": order.customer_address,
        "delivery_message": order.delivery_message,
        "price": order.price,
        "status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


@router.post("/", response_model=OrderResponse)
async def create_order(
    background_tasks: BackgroundTasks,
    stand_id: int = Form(...),
    stand_name: str = Form(...),  # 거치대 이름
    qr_url: str = Form(...),
    customization: str = Form(...),  # JSON string
    customer_email: str = Form(...),
    customer_name: str = Form(...),
    customer_phone: str = Form(...),  # 전화번호
    customer_postal_code: str = Form(...),  # 우편번호
    customer_address: str = Form(...),  # 상세 주소
    delivery_message: str = Form(""),  # 배송 메시지 (선택사항)
    price: float = Form(...),  # 주문 가격
    model_obj_file: UploadFile = File(...),  # 3D 모델 OBJ 파일
    model_mtl_file: UploadFile = File(...),  # 3D 모델 MTL 파일
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    주문 생성

    1. OBJ+MTL 파일 저장 (user_id_timestamp.obj/mtl 형식)
    2. DB에 주문 저장
    3. 다운로드 URL 반환
    """
    # 1. customization JSON 파싱
    try:
        customization_data = json.loads(customization)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid customization JSON")

    # 2. 주문 UUID 생성
    order_uuid = str(uuid.uuid4())

    # 3. OBJ+MTL 파일 저장 (파일명: {email}_{timestamp}.obj/mtl)
    try:
        obj_path, mtl_path = await storage.save_order_model(
            order_uuid,
            customer_email,
            model_obj_file,
            model_mtl_file
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")

    # 4. 주문 정보 JSON 저장
    order_info = {
        "order_uuid": order_uuid,
        "stand_id": stand_id,
        "stand_name": stand_name,
        "qr_url": qr_url,
        "customization": customization_data,
        "customer": {
            "email": customer_email,
            "name": customer_name,
            "phone": customer_phone,
            "postal_code": customer_postal_code,
            "address": customer_address,
            "delivery_message": delivery_message
        },
        "price": price
    }
    await storage.save_order_info(order_uuid, order_info)

    # 5. DB에 주문 생성
    new_order = Order(
        order_uuid=order_uuid,
        stand_id=stand_id,
        stand_name=stand_name,
        qr_url=qr_url,
        customization=customization_data,
        user_id=user_id,  # Clerk User ID
        customer_email=customer_email,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_postal_code=customer_postal_code,
        customer_address=customer_address,
        delivery_message=delivery_message,
        price=price,
        status="pending",  # 입금 대기 상태로 시작
        stl_file_path=obj_path  # OBJ 파일 경로 저장 (MTL은 같은 폴더에 있음)
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # 6. 텔레그램 알림 전송 (백그라운드 태스크로 실행)
    background_tasks.add_task(
        send_order_notification,
        order_uuid=order_uuid,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_address=customer_address,
        customer_postal_code=customer_postal_code,
        stand_name=stand_name,
        qr_url=qr_url,
        price=price
    )

    # 7. 주문 완료 응답 (payment_url은 더 이상 사용하지 않음)
    return {
        "order_uuid": order_uuid,
        "payment_url": ""  # 빈 문자열로 변경
    }


@router.get("/my-orders")
async def get_my_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    내 주문 목록 조회 (로그인한 사용자 본인의 주문만)
    """
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    result = [serialize_order(order) for order in orders]

    return result


@router.get("/list")
async def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):
    """
    주문 목록 조회 (어드민용 - 관리자만 접근 가능)
    """
    orders = db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    result = [serialize_order(order) for order in orders]

    return result


# PATCH route must come before DELETE because it has a more specific path (/status suffix and /cancel suffix)
@router.patch("/{order_uuid}/cancel")
async def cancel_my_order(
    order_uuid: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    주문 취소 (고객 본인만 가능, pending 상태만 취소 가능)
    """
    # 주문 조회
    order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 본인 주문인지 확인
    if order.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own orders"
        )

    # pending 상태만 취소 가능
    if order.status != "pending":
        status_messages = {
            "paid": "입금이 확인되어 제작이 시작되었습니다. 취소가 불가능합니다.",
            "completed": "이미 배송이 완료된 주문입니다.",
            "failed": "이미 취소된 주문입니다."
        }
        message = status_messages.get(order.status, "이 주문은 취소할 수 없습니다.")
        raise HTTPException(
            status_code=400,
            detail=message
        )

    # 상태를 failed로 변경
    order.status = "failed"
    db.commit()
    db.refresh(order)

    return {
        "message": "Order cancelled successfully",
        "order_uuid": order_uuid,
        "status": "failed"
    }


@router.patch("/{order_uuid}/status")
async def update_order_status(
    order_uuid: str,
    status: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
):
    """
    주문 상태 업데이트 (관리자 전용)
    status: pending, paid, completed, failed 중 하나
    """
    # 유효한 상태 값 확인
    valid_statuses = ["pending", "paid", "completed", "failed"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    # 주문 조회
    order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 상태 업데이트
    order.status = status
    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_uuid": order_uuid,
        "status": status
    }


# DELETE route must come before GET because DELETE is more specific in HTTP method
@router.delete("/{order_uuid}")
async def delete_order(
    order_uuid: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
):
    """
    주문 삭제 (관리자 전용)
    STL 파일과 주문 데이터를 모두 삭제합니다.
    """
    # 주문 조회
    order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # STL 파일 삭제
    if order.stl_file_path and os.path.exists(order.stl_file_path):
        try:
            os.remove(order.stl_file_path)
        except Exception as e:
            logger.warning(f"Failed to delete STL file: {e}")

    # 주문 폴더 삭제 (order_info.json 포함)
    order_dir = os.path.join(settings.storage_path, order_uuid)
    if os.path.exists(order_dir):
        try:
            import shutil
            shutil.rmtree(order_dir)
        except Exception as e:
            logger.warning(f"Failed to delete order directory: {e}")

    # DB에서 주문 삭제
    db.delete(order)
    db.commit()

    return {"message": "Order deleted successfully", "order_uuid": order_uuid}


# GET route for individual order - must come LAST because it's the most generic
@router.get("/{order_uuid}")
async def get_order(order_uuid: str, db: Session = Depends(get_db)):
    """
    주문 상세 조회
    """
    order = db.query(Order).filter(Order.order_uuid == order_uuid).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": order.id,
        "order_uuid": order.order_uuid,
        "stand_id": order.stand_id,
        "stand_name": order.stand_name,
        "qr_url": order.qr_url,
        "customization": order.customization,
        "customer_email": order.customer_email,
        "customer_name": order.customer_name,
        "customer_address": order.customer_address,
        "status": order.status,
        "payment_id": order.payment_id,
        "stl_file_path": order.stl_file_path,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
    }
