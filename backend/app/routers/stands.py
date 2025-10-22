from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.stand import Stand
from app.schemas.stand import StandResponse

router = APIRouter()


@router.get("/", response_model=List[StandResponse])
async def get_stands(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """거치대 목록 조회"""
    stands = db.query(Stand).filter(Stand.is_active == True).offset(skip).limit(limit).all()
    return stands


@router.get("/{stand_id}", response_model=StandResponse)
async def get_stand(stand_id: int, db: Session = Depends(get_db)):
    """거치대 상세 조회"""
    stand = db.query(Stand).filter(Stand.id == stand_id, Stand.is_active == True).first()
    if not stand:
        raise HTTPException(status_code=404, detail="Stand not found")
    return stand
