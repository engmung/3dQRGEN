from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db
from app.models.order_group import OrderGroup
from app.models.order_line_item import OrderLineItem
from app.models.pricing import PricingSetting
from app.models.production_schedule import ProductionSchedule
from app.schemas.order_group import OrderGroupCreateResponse, OrderGroupResponse
from app.services import storage
from app.services.telegram import send_order_notification
from app.services.pricing_service import calculate_product_price, get_pricing_settings, validate_price
from app.constants import OrderStatus, PRICE_TOLERANCE
from app.config import settings
from app.auth import get_current_user_id, get_admin_user
from typing import List
from datetime import date
import json
import uuid
import logging
import os
import zipfile
import tempfile

logger = logging.getLogger(__name__)

router = APIRouter()


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
        "production_date": order_group.production_date.isoformat() if order_group.production_date else None,
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
                "qr_url": item.qr_url,
                "customization": item.customization,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
                "production_date": item.production_date.isoformat() if item.production_date else None,
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
    # Line items (JSON array with production_date per item)
    line_items_json: str = Form(...),  # JSON array of line item data
    # Files (동적으로 받음)
    files: List[UploadFile] = File(...),
    # Auth
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    주문 그룹 생성 (장바구니 전체 제출)

    1. Line items JSON 파싱 (production_date 없음)
    2. 🔥 자동 배분: 가능한 가장 빠른 날짜부터 자동 할당
    3. OrderGroup 생성
    4. 각 line item에 대해:
       - 가격 계산 및 검증
       - OBJ/MTL 파일 저장
       - OrderLineItem 생성 (자동 배분된 날짜)
    5. 총 가격 계산
    6. 날짜별 예약량 증가
    7. 텔레그램 알림 전송
    """
    from app.services.production_allocator import allocate_production_dates

    # 1. Line items JSON 파싱
    try:
        line_items_data = json.loads(line_items_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid line_items JSON")

    if not isinstance(line_items_data, list) or len(line_items_data) == 0:
        raise HTTPException(status_code=400, detail="line_items must be a non-empty array")

    # 2. 총 수량 계산
    total_quantity = sum(item.get('quantity', 1) for item in line_items_data)

    # 3. 🔥 자동 배분: 가능한 가장 빠른 날짜부터 순차 채우기
    allocation = allocate_production_dates(total_quantity, db)
    # → {date(2025-11-01): 3, date(2025-11-02): 2}

    # 4. 배분된 날짜들을 행 잠금으로 조회
    schedules_to_update = {}
    for alloc_date, alloc_qty in allocation.items():
        schedule = db.query(ProductionSchedule).filter(
            ProductionSchedule.date == alloc_date
        ).with_for_update().first()

        if not schedule:
            raise HTTPException(status_code=500, detail=f"Schedule inconsistency for {alloc_date.isoformat()}")

        schedules_to_update[alloc_date] = (schedule, alloc_qty)

    # 4. 가격 설정 가져오기
    pricing_settings = get_pricing_settings(db)

    # 5. OrderGroup 생성 (production_date는 NULL)
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
        production_date=None,  # DEPRECATED (LineItem별 날짜 사용)
        status="pending",
        total_price=0.0  # 나중에 계산
    )
    db.add(order_group)
    db.flush()  # order_group.id 생성

    # 6. 제품을 순서대로 배분된 날짜에 할당
    # allocation을 소비 가능한 카운터로 변환
    remaining_allocation = {d: q for d, q in allocation.items()}
    sorted_dates = sorted(remaining_allocation.keys())

    total_price = 0.0
    file_index = 0

    for i, item_data in enumerate(line_items_data):
        # Line item 데이터 추출
        product_sku = item_data.get('product_sku')
        qr_url = item_data.get('qr_url')
        customization = item_data.get('customization', {})
        quantity = item_data.get('quantity', 1)

        if not product_sku or not qr_url or quantity < 1:
            raise HTTPException(status_code=400, detail=f"Invalid line item #{i}: missing required fields")

        # 가격 계산
        unit_price = calculate_product_price(customization, pricing_settings)
        item_total_price = unit_price * quantity

        # 가격 검증 (클라이언트가 보낸 가격과 비교) - 선택적
        client_unit_price = item_data.get('unit_price')
        if client_unit_price and not validate_price(client_unit_price, unit_price, PRICE_TOLERANCE):
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
                customer_name,
                i + 1,  # 제품 번호 (1부터 시작)
                quantity,
                obj_file,
                mtl_file
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File save error for line item #{i}: {str(e)}")

        # 🔥 이 제품의 수량을 배분된 날짜에 할당
        # 배분 정보를 production_dates JSON에 저장
        item_remaining = quantity
        production_allocation = {}  # {date_str: qty}
        first_production_date = None

        for alloc_date in sorted_dates:
            if item_remaining <= 0:
                break

            available = remaining_allocation.get(alloc_date, 0)
            if available <= 0:
                continue

            # 이 날짜에 할당할 수량
            allocated = min(item_remaining, available)

            # JSON 저장용 날짜 문자열
            date_str = alloc_date.isoformat()
            production_allocation[date_str] = allocated

            # 첫 번째 배분 날짜 저장 (하위 호환용)
            if first_production_date is None:
                first_production_date = alloc_date

            # 카운터 업데이트
            remaining_allocation[alloc_date] -= allocated
            item_remaining -= allocated

        # 단일 LineItem 생성 (분할하지 않음)
        line_item = OrderLineItem(
            line_item_uuid=line_item_uuid,  # 파일 저장 시 사용한 UUID
            order_group_id=order_group.id,
            product_sku=product_sku,
            qr_url=qr_url,
            customization=customization,
            quantity=quantity,  # 전체 수량
            unit_price=unit_price,
            total_price=item_total_price,
            production_date=first_production_date,  # 첫 번째 배분 날짜 (하위 호환용)
            production_dates=production_allocation,  # 🔥 {"2025-11-01": 3, "2025-11-02": 2}
            obj_file_path=obj_path,
            mtl_file_path=mtl_path
        )
        db.add(line_item)

        total_price += item_total_price

    # 7. OrderGroup total_price 업데이트
    order_group.total_price = total_price

    # 8. 날짜별 예약량 증가
    for target_date, (schedule, total_qty) in schedules_to_update.items():
        schedule.reserved_quantity += total_qty

    db.commit()
    db.refresh(order_group)

    # 7. 텔레그램 알림 전송 (백그라운드)
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

    # 9. 응답 (배분 결과 포함)
    return {
        "group_uuid": group_uuid,
        "total_price": total_price,
        "line_item_count": len(line_items_data),
        "allocation": {d.isoformat(): q for d, q in allocation.items()},  # 🔥 날짜별 배분 결과
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


@router.get("/admin/list", response_model=List[OrderGroupResponse])
async def get_all_order_groups_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    관리자용 전체 주문 그룹 목록 조회
    """
    order_groups = db.query(OrderGroup).order_by(
        OrderGroup.created_at.desc()
    ).offset(skip).limit(limit).all()

    return [serialize_order_group(og) for og in order_groups]


@router.patch("/{group_uuid}/status")
async def update_order_group_status(
    group_uuid: str,
    status: str,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    주문 그룹 상태 업데이트 (관리자 전용)
    """
    if not OrderStatus.validate(status):
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(OrderStatus.all())}")

    order_group = db.query(OrderGroup).filter(OrderGroup.group_uuid == group_uuid).first()
    if not order_group:
        raise HTTPException(status_code=404, detail="Order group not found")

    order_group.status = status
    db.commit()

    return {"message": f"Order group status updated to {status}"}


@router.patch("/{group_uuid}/cancel")
async def cancel_order_group(
    group_uuid: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    주문 그룹 취소 (사용자: 본인 주문 + pending만, 관리자: 모두 가능)
    """
    order_group = db.query(OrderGroup).filter(OrderGroup.group_uuid == group_uuid).first()
    if not order_group:
        raise HTTPException(status_code=404, detail="Order group not found")

    # 본인 주문 확인
    if order_group.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    # pending 상태만 취소 가능
    if order_group.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order in '{order_group.status}' status. Only 'pending' orders can be cancelled."
        )

    order_group.status = OrderStatus.FAILED
    db.commit()

    return {"message": "Order group cancelled"}


@router.delete("/{group_uuid}")
async def delete_order_group(
    group_uuid: str,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    주문 그룹 삭제 (관리자 전용)
    - 생산 일정 예약량 감소 포함
    """
    order_group = db.query(OrderGroup).filter(OrderGroup.group_uuid == group_uuid).first()
    if not order_group:
        raise HTTPException(status_code=404, detail="Order group not found")

    # 🔥 생산 일정 예약량 감소 (production_dates 기준)
    from collections import defaultdict
    date_quantity_map = defaultdict(int)

    for item in order_group.line_items:
        if item.production_dates:
            # {"2025-11-01": 3, "2025-11-02": 2} 형식
            for date_str, qty in item.production_dates.items():
                prod_date = date.fromisoformat(date_str)
                date_quantity_map[prod_date] += qty

    # 날짜별로 예약량 감소
    for prod_date, total_qty in date_quantity_map.items():
        schedule = db.query(ProductionSchedule).filter(
            ProductionSchedule.date == prod_date
        ).first()

        if schedule:
            schedule.reserved_quantity = max(0, schedule.reserved_quantity - total_qty)

    # 파일 디렉토리 삭제
    try:
        await storage.delete_order_group_files(group_uuid)
    except Exception as e:
        logger.warning(f"Failed to delete files for order group {group_uuid}: {str(e)}")

    # DB에서 삭제 (line_items는 cascade로 자동 삭제됨)
    db.delete(order_group)
    db.commit()

    return {"message": "Order group deleted"}


@router.get("/{group_uuid}/download")
async def download_order_group_files(
    group_uuid: str,
    db: Session = Depends(get_db)
):
    """
    주문 그룹의 모든 파일을 ZIP으로 다운로드 (의미있는 파일명으로)
    """
    order_group = db.query(OrderGroup).filter(OrderGroup.group_uuid == group_uuid).first()
    if not order_group:
        raise HTTPException(status_code=404, detail="Order group not found")

    group_dir = os.path.join(settings.storage_path, "order_groups", group_uuid)
    if not os.path.exists(group_dir):
        raise HTTPException(status_code=404, detail="Order files not found")

    # 주문 시간 포맷 (YYYY-MM-DD_HH-MM)
    order_time = order_group.created_at.strftime("%Y-%m-%d_%H-%M") if order_group.created_at else "unknown"

    # 고객명 (파일명에 안전한 문자로 변환)
    customer_name = order_group.customer_name.replace(" ", "_").replace("/", "-").replace("\\", "-")

    # ZIP 파일명
    zip_filename = f"{customer_name}_{order_time}.zip"

    # 임시 ZIP 파일 생성
    temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
    try:
        with zipfile.ZipFile(temp_zip.name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # line_items를 순회하면서 파일 추가
            for line_item in order_group.line_items:
                line_item_dir = os.path.join(group_dir, line_item.line_item_uuid)

                if not os.path.exists(line_item_dir):
                    logger.warning(f"Line item directory not found: {line_item_dir}")
                    continue

                # 디렉토리 내 모든 .obj와 .mtl 파일 찾기 (이미 의미있는 파일명으로 저장됨)
                obj_files, mtl_files = storage.find_model_files(line_item_dir)

                # OBJ 파일 추가
                for obj_path in obj_files:
                    zipf.write(obj_path, os.path.basename(obj_path))

                # MTL 파일 추가
                for mtl_path in mtl_files:
                    zipf.write(mtl_path, os.path.basename(mtl_path))

        # ZIP 파일 반환
        return FileResponse(
            temp_zip.name,
            media_type='application/zip',
            filename=zip_filename
        )
    except Exception as e:
        # 에러 발생 시 임시 파일 삭제
        if os.path.exists(temp_zip.name):
            os.unlink(temp_zip.name)
        raise HTTPException(status_code=500, detail=f"Failed to create zip file: {str(e)}")


@router.get("/{group_uuid}/line-items/{line_item_uuid}/download")
async def download_line_item_files(
    group_uuid: str,
    line_item_uuid: str,
    db: Session = Depends(get_db)
):
    """
    특정 LineItem의 OBJ/MTL 파일을 ZIP으로 다운로드
    """
    from app.models.order_line_item import OrderLineItem

    # OrderGroup 확인
    order_group = db.query(OrderGroup).filter(OrderGroup.group_uuid == group_uuid).first()
    if not order_group:
        raise HTTPException(status_code=404, detail="Order group not found")

    # LineItem 확인
    line_item = db.query(OrderLineItem).filter(
        OrderLineItem.line_item_uuid == line_item_uuid,
        OrderLineItem.order_group_id == order_group.id
    ).first()

    if not line_item:
        raise HTTPException(status_code=404, detail="Line item not found")

    # 파일 경로 확인
    line_item_dir = os.path.join(settings.storage_path, "order_groups", group_uuid, line_item_uuid)
    if not os.path.exists(line_item_dir):
        raise HTTPException(status_code=404, detail="Line item files not found")

    # 디렉토리 내 .obj, .mtl 파일 찾기 (이미 의미있는 파일명으로 저장됨)
    obj_files, mtl_files = storage.find_model_files(line_item_dir)

    if not obj_files:
        raise HTTPException(status_code=404, detail="OBJ file not found")

    # 고객명과 주문 시간
    customer_name = order_group.customer_name.replace(" ", "_").replace("/", "-").replace("\\", "-")
    order_time = order_group.created_at.strftime("%Y-%m-%d_%H-%M") if order_group.created_at else "unknown"

    # ZIP 파일명: {고객명}_{LineItem UUID 앞 8자}_{시간}.zip
    zip_filename = f"{customer_name}_{line_item_uuid[:8]}_{order_time}.zip"

    # 임시 ZIP 파일 생성
    temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
    try:
        with zipfile.ZipFile(temp_zip.name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # OBJ 파일 추가 (원본 파일명 유지)
            for obj_path in obj_files:
                zipf.write(obj_path, os.path.basename(obj_path))

            # MTL 파일 추가 (원본 파일명 유지)
            for mtl_path in mtl_files:
                zipf.write(mtl_path, os.path.basename(mtl_path))

        # ZIP 파일 반환
        return FileResponse(
            temp_zip.name,
            media_type='application/zip',
            filename=zip_filename
        )
    except Exception as e:
        # 에러 발생 시 임시 파일 삭제
        if os.path.exists(temp_zip.name):
            os.unlink(temp_zip.name)
        raise HTTPException(status_code=500, detail=f"Failed to create zip file: {str(e)}")


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
