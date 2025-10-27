from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.production_schedule import ProductionSchedule
from app.models.order_group import OrderGroup
from app.auth import get_admin_user
from typing import List
from datetime import date, timedelta
from pydantic import BaseModel

router = APIRouter()


# Pydantic 스키마
class ProductionScheduleResponse(BaseModel):
    id: int
    date: str  # YYYY-MM-DD
    max_capacity: int
    reserved_quantity: int
    is_available: bool
    available_slots: int

    class Config:
        from_attributes = True


class ProductionScheduleUpdate(BaseModel):
    max_capacity: int | None = None
    is_available: bool | None = None


class ProductionScheduleCreate(BaseModel):
    date: str  # YYYY-MM-DD
    max_capacity: int
    is_available: bool = True


@router.get("/available", response_model=List[ProductionScheduleResponse])
async def get_available_dates(
    db: Session = Depends(get_db)
):
    """
    주문 가능한 날짜 목록 조회 (공개 API)
    - 오늘부터 60일 이내
    - is_available=True AND reserved_quantity < max_capacity
    """
    today = date.today()
    end_date = today + timedelta(days=60)

    schedules = db.query(ProductionSchedule).filter(
        ProductionSchedule.date >= today,
        ProductionSchedule.date <= end_date,
        ProductionSchedule.is_available == True
    ).order_by(ProductionSchedule.date).all()

    # 예약 가능한 날짜만 필터링 (available_slots > 0)
    result = []
    for schedule in schedules:
        if schedule.available_slots > 0:
            result.append(ProductionScheduleResponse(
                id=schedule.id,
                date=schedule.date.isoformat(),
                max_capacity=schedule.max_capacity,
                reserved_quantity=schedule.reserved_quantity,
                is_available=schedule.is_available,
                available_slots=schedule.available_slots
            ))

    return result


@router.get("/admin", response_model=List[ProductionScheduleResponse])
async def get_all_schedules(
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    전체 생산 일정 조회 (관리자 전용)
    - start_date, end_date로 기간 필터링 가능
    """
    query = db.query(ProductionSchedule)

    if start_date:
        query = query.filter(ProductionSchedule.date >= date.fromisoformat(start_date))
    if end_date:
        query = query.filter(ProductionSchedule.date <= date.fromisoformat(end_date))

    schedules = query.order_by(ProductionSchedule.date).all()

    result = []
    for schedule in schedules:
        result.append(ProductionScheduleResponse(
            id=schedule.id,
            date=schedule.date.isoformat(),
            max_capacity=schedule.max_capacity,
            reserved_quantity=schedule.reserved_quantity,
            is_available=schedule.is_available,
            available_slots=schedule.available_slots
        ))

    return result


@router.post("/admin", response_model=ProductionScheduleResponse)
async def create_schedule(
    data: ProductionScheduleCreate,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    특정 날짜 생산 일정 생성 (관리자 전용)
    """
    schedule_date = date.fromisoformat(data.date)

    # 이미 존재하는지 확인
    existing = db.query(ProductionSchedule).filter(
        ProductionSchedule.date == schedule_date
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Schedule for this date already exists")

    new_schedule = ProductionSchedule(
        date=schedule_date,
        max_capacity=data.max_capacity,
        is_available=data.is_available,
        reserved_quantity=0
    )

    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)

    return ProductionScheduleResponse(
        id=new_schedule.id,
        date=new_schedule.date.isoformat(),
        max_capacity=new_schedule.max_capacity,
        reserved_quantity=new_schedule.reserved_quantity,
        is_available=new_schedule.is_available,
        available_slots=new_schedule.available_slots
    )


@router.patch("/admin/{schedule_date}", response_model=ProductionScheduleResponse)
async def update_schedule(
    schedule_date: str,  # YYYY-MM-DD
    data: ProductionScheduleUpdate,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    특정 날짜 생산 일정 수정 (관리자 전용)
    """
    target_date = date.fromisoformat(schedule_date)

    schedule = db.query(ProductionSchedule).filter(
        ProductionSchedule.date == target_date
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    # 수정 적용
    if data.max_capacity is not None:
        if data.max_capacity < schedule.reserved_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot set max_capacity below reserved_quantity ({schedule.reserved_quantity})"
            )
        schedule.max_capacity = data.max_capacity

    if data.is_available is not None:
        schedule.is_available = data.is_available

    db.commit()
    db.refresh(schedule)

    return ProductionScheduleResponse(
        id=schedule.id,
        date=schedule.date.isoformat(),
        max_capacity=schedule.max_capacity,
        reserved_quantity=schedule.reserved_quantity,
        is_available=schedule.is_available,
        available_slots=schedule.available_slots
    )


@router.delete("/admin/{schedule_date}")
async def disable_schedule(
    schedule_date: str,  # YYYY-MM-DD
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    특정 날짜 주문 불가 설정 (is_available=False)
    """
    target_date = date.fromisoformat(schedule_date)

    schedule = db.query(ProductionSchedule).filter(
        ProductionSchedule.date == target_date
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    schedule.is_available = False
    db.commit()

    return {"message": f"Schedule for {schedule_date} has been disabled"}


@router.get("/admin/{schedule_date}/orders")
async def get_date_orders(
    schedule_date: str,  # YYYY-MM-DD
    db: Session = Depends(get_db),
    admin_user: dict = Depends(get_admin_user)
):
    """
    특정 날짜의 주문 목록 조회 (관리자 전용)
    LineItem 기준으로 날짜 필터링
    """
    from app.models.order_line_item import OrderLineItem
    from collections import defaultdict

    target_date = date.fromisoformat(schedule_date)
    target_date_str = target_date.isoformat()

    # 🔥 production_dates JSON에서 해당 날짜 포함된 LineItem 조회
    # Python에서 필터링 (SQLite JSON 쿼리보다 안전)
    all_line_items = db.query(OrderLineItem).filter(
        OrderLineItem.production_dates.isnot(None)
    ).all()

    # 해당 날짜가 포함된 LineItem만 필터링
    line_items = [
        item for item in all_line_items
        if item.production_dates and target_date_str in item.production_dates
    ]

    # OrderGroup별로 집계
    order_map = defaultdict(lambda: {"line_items": [], "total_qty": 0})

    for item in line_items:
        order_group = item.order_group
        quantity_for_this_date = item.production_dates.get(target_date_str, 0)

        order_map[order_group.group_uuid]["order_group"] = order_group
        order_map[order_group.group_uuid]["line_items"].append({
            "line_item_uuid": item.line_item_uuid,
            "product_sku": item.product_sku,
            "quantity": item.quantity,  # 전체 수량
            "quantity_for_this_date": quantity_for_this_date,  # 🔥 이 날짜 수량
            "production_dates": item.production_dates,  # 🔥 전체 배분 정보
            "qr_url": item.qr_url,
            "obj_file_path": item.obj_file_path,
            "mtl_file_path": item.mtl_file_path
        })
        order_map[order_group.group_uuid]["total_qty"] += quantity_for_this_date

    # 결과 생성
    result = []
    for group_uuid, data in order_map.items():
        order_group = data["order_group"]
        result.append({
            "group_uuid": group_uuid,
            "customer_name": order_group.customer_name,
            "customer_phone": order_group.customer_phone,
            "customer_address": order_group.customer_address,
            "total_quantity": data["total_qty"],  # 이 날짜의 제품 수량
            "line_items": data["line_items"],  # 이 날짜의 제품 목록
            "status": order_group.status,
            "created_at": order_group.created_at.isoformat() if order_group.created_at else None
        })

    return {
        "date": schedule_date,
        "total_orders": len(result),
        "total_quantity": sum(r["total_quantity"] for r in result),
        "orders": result
    }
