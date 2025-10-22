"""파일 저장 및 관리 서비스"""
import os
import json
import aiofiles
from fastapi import UploadFile
from app.config import settings


async def save_order_stl(order_uuid: str, file: UploadFile) -> str:
    """
    STL 파일 저장

    Args:
        order_uuid: 주문 UUID
        file: 업로드된 STL 파일

    Returns:
        저장된 파일 경로
    """
    # 주문별 디렉토리 생성
    order_dir = os.path.join(settings.storage_path, order_uuid)
    os.makedirs(order_dir, exist_ok=True)

    # 파일 경로
    file_path = os.path.join(order_dir, "qr_plate.stl")

    # 파일 저장
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    return file_path


async def save_order_info(order_uuid: str, order_data: dict):
    """
    주문 정보 JSON 저장

    Args:
        order_uuid: 주문 UUID
        order_data: 주문 정보 딕셔너리
    """
    order_dir = os.path.join(settings.storage_path, order_uuid)
    os.makedirs(order_dir, exist_ok=True)

    info_path = os.path.join(order_dir, "order_info.json")

    async with aiofiles.open(info_path, "w", encoding="utf-8") as f:
        await f.write(json.dumps(order_data, ensure_ascii=False, indent=2))


def get_order_stl_path(order_uuid: str) -> str:
    """
    주문의 STL 파일 경로 반환

    Args:
        order_uuid: 주문 UUID

    Returns:
        STL 파일 경로
    """
    return os.path.join(settings.storage_path, order_uuid, "qr_plate.stl")


def check_file_exists(file_path: str) -> bool:
    """
    파일 존재 여부 확인

    Args:
        file_path: 파일 경로

    Returns:
        파일 존재 여부
    """
    return os.path.exists(file_path)
