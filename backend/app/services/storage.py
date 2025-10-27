"""파일 저장 및 관리 서비스"""
import os
import json
import shutil
import aiofiles
from fastapi import UploadFile
from app.config import settings
from datetime import datetime


async def save_order_model(
    order_uuid: str,
    customer_email: str,
    obj_file: UploadFile,
    mtl_file: UploadFile
) -> tuple[str, str]:
    """
    3D 모델 파일 저장 (OBJ + MTL)

    Args:
        order_uuid: 주문 UUID
        customer_email: 고객 이메일
        obj_file: 업로드된 OBJ 파일
        mtl_file: 업로드된 MTL 파일

    Returns:
        (obj_file_path, mtl_file_path) 튜플
    """
    # 주문별 디렉토리 생성
    order_dir = os.path.join(settings.storage_path, order_uuid)
    os.makedirs(order_dir, exist_ok=True)

    # 파일명 생성: {email}_{timestamp}.obj/mtl
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # 이메일에서 @ 기호를 _로 치환 (파일명 안전성)
    safe_email = customer_email.replace("@", "_").replace(".", "_")
    base_filename = f"{safe_email}_{timestamp}"

    # 파일 경로
    obj_path = os.path.join(order_dir, f"{base_filename}.obj")
    mtl_path = os.path.join(order_dir, f"{base_filename}.mtl")

    # OBJ 파일 저장
    async with aiofiles.open(obj_path, "wb") as f:
        content = await obj_file.read()
        await f.write(content)

    # MTL 파일 저장
    async with aiofiles.open(mtl_path, "wb") as f:
        content = await mtl_file.read()
        await f.write(content)

    return obj_path, mtl_path


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
    주문의 OBJ 파일 경로 반환

    Args:
        order_uuid: 주문 UUID

    Returns:
        OBJ 파일 경로
    """
    return os.path.join(settings.storage_path, order_uuid, "qr_plate.obj")


async def save_order_group_files(
    group_uuid: str,
    line_item_uuid: str,
    customer_name: str,
    product_index: int,
    quantity: int,
    obj_file: UploadFile,
    mtl_file: UploadFile
) -> tuple[str, str]:
    """
    Order Group의 Line Item 파일 저장 (OBJ + MTL)
    파일명: {고객명}_제품{번호}(x{수량})_{주문시간}.obj/mtl

    Args:
        group_uuid: 주문 그룹 UUID
        line_item_uuid: 라인 아이템 UUID
        customer_name: 고객명
        product_index: 제품 번호 (1부터 시작)
        quantity: 수량
        obj_file: 업로드된 OBJ 파일
        mtl_file: 업로드된 MTL 파일

    Returns:
        (obj_file_path, mtl_file_path) 튜플
    """
    # 디렉토리 구조: /storage/order_groups/{group_uuid}/{line_item_uuid}/
    group_dir = os.path.join(settings.storage_path, "order_groups", group_uuid, line_item_uuid)
    os.makedirs(group_dir, exist_ok=True)

    # 주문 시간 포맷 (YYYY-MM-DD_HH-MM)
    order_time = datetime.now().strftime("%Y-%m-%d_%H-%M")

    # 고객명 (파일명에 안전한 문자로 변환)
    safe_customer_name = customer_name.replace(" ", "_").replace("/", "-").replace("\\", "-")

    # 파일명: {고객명}_제품{번호}(x{수량})_{주문시간}
    base_filename = f"{safe_customer_name}_제품{product_index}(x{quantity})_{order_time}"

    obj_path = os.path.join(group_dir, f"{base_filename}.obj")
    mtl_path = os.path.join(group_dir, f"{base_filename}.mtl")

    # OBJ 파일 저장
    async with aiofiles.open(obj_path, "wb") as f:
        content = await obj_file.read()
        await f.write(content)

    # MTL 파일 저장
    async with aiofiles.open(mtl_path, "wb") as f:
        content = await mtl_file.read()
        await f.write(content)

    return obj_path, mtl_path


async def delete_order_group_files(group_uuid: str):
    """
    Order Group의 모든 파일 삭제

    Args:
        group_uuid: 주문 그룹 UUID
    """
    group_dir = os.path.join(settings.storage_path, "order_groups", group_uuid)
    if os.path.exists(group_dir):
        shutil.rmtree(group_dir)


def check_file_exists(file_path: str) -> bool:
    """
    파일 존재 여부 확인

    Args:
        file_path: 파일 경로

    Returns:
        파일 존재 여부
    """
    return os.path.exists(file_path)
