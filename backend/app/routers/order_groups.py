from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order_group import OrderGroup
from app.models.order_line_item import OrderLineItem
from app.models.pricing import PricingSetting
from app.schemas.order_group import OrderGroupCreateResponse, OrderGroupResponse
from app.services import storage
from app.services.telegram import send_order_notification
from app.config import settings
from app.auth import get_current_user_id
from typing import List
import json
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def calculate_line_item_price(customization_data: dict, pricing: PricingSetting) -> float:
    """
    라인 아이템 단가 계산 (orders.py의 calculate_expected_price와 동일)

    Args:
        customization_data: 판 설정 데이터 (text, images 포함)
        pricing: 현재 가격 설정

    Returns:
        단가 (unit_price)
    """
    price = pricing.base_price

    # 텍스트 추가 비용
    text_content = customization_data.get('text', '')
    if text_content and text_content.strip():
        price += pricing.text_price

    # 이미지 추가 비용
    images = customization_data.get('images', [])
    if images and len(images) > 0:
        price += pricing.image_price * len(images)

    return price


def serialize_order_group(order_group: OrderGroup) -> dict:
    """주문 그룹을 API 응답 딕셔너리로 변환"""
    return {
        "id": order_group.id,
        "group_uuid": order_group.group_uuid,
        "user_id": order_group.user_id,
        "customer_email": order_group.customer_email,
        "customer_name": order_group.customer_name,
        "customer_phone": order_group.customer_phone,
        "customer_postal_code": order_group.customer_postal_code,
        "customer_address": order_group.customer_address,
        "delivery_message": order_group.delivery_message,
        "status": order_group.status,
        "payment_id": order_group.payment_id,
        "total_price": order_group.total_price,
        "created_at": order_group.created_at.isoformat() if order_group.created_at else None,
        "updated_at": order_group.updated_at.isoformat() if order_group.updated_at else None,
        "line_items": [
            {
                "id": item.id,
                "line_item_uuid": item.line_item_uuid,
                "product_sku": item.product_sku,
                "stand_sku": item.stand_sku,
                "qr_url": item.qr_url,
                "customization": item.customization,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
                "obj_file_path": item.obj_file_path,
                "mtl_file_path": item.mtl_file_path,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in order_group.line_items
        ]
    }


@router.post("/", response_model=OrderGroupCreateResponse)
async def create_order_group(
    background_tasks: BackgroundTasks,
    # Customer info
    customer_email: str = Form(...),
    customer_name: str = Form(...),
    customer_phone: str = Form(...),
    customer_postal_code: str = Form(...),
    customer_address: str = Form(...),
    delivery_message: str = Form(""),
    # Line items (JSON array)
    line_items_json: str = Form(...),  # JSON array of line item data
    # Files (동적으로 받음)
    files: List[UploadFile] = File(...),
    # Auth
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    주문 그룹 생성 (장바구니 전체 제출)

    1. OrderGroup 생성
    2. 각 line item에 대해:
       - 가격 계산 및 검증
       - OBJ/MTL 파일 저장
       - OrderLineItem 생성
    3. 총 가격 계산
    4. 텔레그램 알림 전송
    """
    # 1. Line items JSON 파싱
    try:
        line_items_data = json.loads(line_items_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid line_items JSON")

    if not isinstance(line_items_data, list) or len(line_items_data) == 0:
        raise HTTPException(status_code=400, detail="line_items must be a non-empty array")

    # 2. 가격 설정 가져오기
    pricing_settings = db.query(PricingSetting).first()
    if not pricing_settings:
        raise HTTPException(status_code=500, detail="Pricing settings not found")

    # 3. OrderGroup 생성
    group_uuid = str(uuid.uuid4())
    order_group = OrderGroup(
        group_uuid=group_uuid,
        user_id=user_id,
        customer_email=customer_email,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_postal_code=customer_postal_code,
        customer_address=customer_address,
        delivery_message=delivery_message,
        status="pending",
        total_price=0.0  # 나중에 계산
    )
    db.add(order_group)
    db.flush()  # order_group.id 생성

    # 4. 각 line item 처리
    total_price = 0.0
    file_index = 0

    for i, item_data in enumerate(line_items_data):
        # Line item 데이터 추출
        product_sku = item_data.get('product_sku')
        stand_sku = item_data.get('stand_sku')
        qr_url = item_data.get('qr_url')
        customization = item_data.get('customization', {})
        quantity = item_data.get('quantity', 1)

        if not product_sku or not qr_url or quantity < 1:
            raise HTTPException(status_code=400, detail=f"Invalid line item #{i}: missing required fields")

        # 가격 계산
        unit_price = calculate_line_item_price(customization, pricing_settings)
        item_total_price = unit_price * quantity

        # 가격 검증 (클라이언트가 보낸 가격과 비교) - 선택적
        client_unit_price = item_data.get('unit_price')
        if client_unit_price and abs(client_unit_price - unit_price) > 1:
            raise HTTPException(
                status_code=400,
                detail=f"Line item #{i} price mismatch. Expected: {unit_price}, Received: {client_unit_price}"
            )

        # Line item UUID 생성
        line_item_uuid = str(uuid.uuid4())

        # 파일 저장 (OBJ + MTL)
        if file_index + 1 >= len(files):
            raise HTTPException(
                status_code=400,
                detail=f"Missing files for line item #{i} (expected OBJ and MTL)"
            )

        obj_file = files[file_index]
        mtl_file = files[file_index + 1]
        file_index += 2

        try:
            obj_path, mtl_path = await storage.save_order_group_files(
                group_uuid,
                line_item_uuid,
                customer_email,
                obj_file,
                mtl_file
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File save error for line item #{i}: {str(e)}")

        # OrderLineItem 생성
        line_item = OrderLineItem(
            line_item_uuid=line_item_uuid,
            order_group_id=order_group.id,
            product_sku=product_sku,
            stand_sku=stand_sku,
            qr_url=qr_url,
            customization=customization,
            quantity=quantity,
            unit_price=unit_price,
            total_price=item_total_price,
            obj_file_path=obj_path,
            mtl_file_path=mtl_path
        )
        db.add(line_item)

        total_price += item_total_price

    # 5. OrderGroup total_price 업데이트
    order_group.total_price = total_price
    db.commit()
    db.refresh(order_group)

    # 6. 텔레그램 알림 전송 (백그라운드)
    background_tasks.add_task(
        send_order_notification,
        order_uuid=group_uuid,  # group_uuid 전달
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_address=customer_address,
        customer_postal_code=customer_postal_code,
        stand_name=f"{len(line_items_data)}개 제품",  # line item 개수
        qr_url="다중 주문",
        price=total_price
    )

    # 7. 응답
    return {
        "group_uuid": group_uuid,
        "total_price": total_price,
        "line_item_count": len(line_items_data),
        "message": f"{len(line_items_data)}개 제품 주문이 성공적으로 생성되었습니다."
    }


@router.get("/my-orders", response_model=List[OrderGroupResponse])
async def get_my_order_groups(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    내 주문 그룹 목록 조회 (로그인한 사용자 본인의 주문만)
    """
    order_groups = db.query(OrderGroup).filter(
        OrderGroup.user_id == user_id
    ).order_by(
        OrderGroup.created_at.desc()
    ).offset(skip).limit(limit).all()

    return [serialize_order_group(og) for og in order_groups]


@router.get("/{group_uuid}", response_model=OrderGroupResponse)
async def get_order_group(
    group_uuid: str,
    db: Session = Depends(get_db)
):
    """
    주문 그룹 상세 조회
    """
    order_group = db.query(OrderGroup).filter(OrderGroup.group_uuid == group_uuid).first()

    if not order_group:
        raise HTTPException(status_code=404, detail="Order group not found")

    return serialize_order_group(order_group)
