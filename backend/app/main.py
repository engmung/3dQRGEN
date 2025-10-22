from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import init_db
import os

# FastAPI 앱 생성
app = FastAPI(
    title="3D QR Platform API",
    description="3D QR 코드 거치대 커스터마이징 플랫폼 백엔드",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙 (거치대 3D 모델, 썸네일)
if not os.path.exists(settings.static_path):
    os.makedirs(settings.static_path, exist_ok=True)

app.mount("/static", StaticFiles(directory=settings.static_path), name="static")


# 라우터 등록
from app.routers import stands, orders, webhooks, downloads
app.include_router(stands.router, prefix="/api/stands", tags=["stands"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(downloads.router, prefix="/api/downloads", tags=["downloads"])


@app.on_event("startup")
async def startup_event():
    """앱 시작 시 실행"""
    # 데이터베이스 초기화
    init_db()
    print("[OK] Database initialized")

    # 필요한 디렉토리 생성
    os.makedirs(settings.storage_path, exist_ok=True)
    print(f"[OK] Storage directory created: {settings.storage_path}")


@app.get("/")
async def root():
    """루트 엔드포인트 (헬스체크)"""
    return {
        "message": "3D QR Platform API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {"status": "healthy"}
