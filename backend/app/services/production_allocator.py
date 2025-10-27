from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.production_schedule import ProductionSchedule


def allocate_production_dates(
    total_quantity: int,
    db: Session
) -> dict[date, int]:
    """
    가능한 가장 빠른 날짜부터 자동으로 생산 일정 배분

    Args:
        total_quantity: 배분할 총 제품 개수
        db: Database session

    Returns:
        {date: quantity} 딕셔너리
        예: {date(2025, 11, 1): 2, date(2025, 11, 2): 3}

    Raises:
        HTTPException(400): 용량 부족 시

    Example:
        >>> allocation = allocate_production_dates(5, db)
        >>> # {date(2025-11-01): 3, date(2025-11-02): 2}
    """
    if total_quantity <= 0:
        raise HTTPException(status_code=400, detail="수량은 1개 이상이어야 합니다.")

    today = date.today()

    # 1. 오늘 이후 + is_available=True인 날짜 조회 (날짜 오름차순)
    schedules = db.query(ProductionSchedule).filter(
        ProductionSchedule.date >= today,
        ProductionSchedule.is_available == True
    ).order_by(ProductionSchedule.date).all()

    if not schedules:
        raise HTTPException(
            status_code=400,
            detail="현재 예약 가능한 날짜가 없습니다. 관리자에게 문의해주세요."
        )

    # 2. 가장 빠른 날짜부터 순차적으로 배분
    allocation = {}
    remaining = total_quantity

    for schedule in schedules:
        if remaining <= 0:
            break

        # 이 날짜의 남은 용량
        available_slots = schedule.max_capacity - schedule.reserved_quantity

        if available_slots <= 0:
            continue  # 이미 꽉 찬 날짜는 스킵

        # 이 날짜에 배분할 수량 (최대한 많이)
        allocated_qty = min(remaining, available_slots)
        allocation[schedule.date] = allocated_qty
        remaining -= allocated_qty

    # 3. 전부 배분하지 못했으면 에러
    if remaining > 0:
        total_allocated = total_quantity - remaining
        raise HTTPException(
            status_code=400,
            detail=f"용량 부족: {total_quantity}개 요청하셨으나, 현재 {total_allocated}개만 예약 가능합니다. 관리자가 추가 일정을 열 때까지 기다려주세요."
        )

    return allocation
