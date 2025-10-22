from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()


@router.post("/lemonsqueezy")
async def lemonsqueezy_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Lemon Squeezy 결제 완료 웹훅

    1. 웹훅 서명 검증
    2. 주문 상태 업데이트 (pending → paid)
    3. 다운로드 토큰 생성
    4. 다운로드 링크 이메일 발송
    """
    # TODO: 실제 구현 필요
    # - 웹훅 서명 검증 (services/payment.py)
    # - 주문 상태 업데이트
    # - 이메일 발송 (services/email.py)

    payload = await request.json()

    # 임시 응답
    return {"status": "webhook received"}
