"""
Clerk JWT 인증 - PyJWT 직접 구현
fastapi-clerk-auth 대신 PyJWT로 직접 JWT 검증
"""
import jwt
import requests
from functools import lru_cache
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Header
from app.config import settings


# JWKS 캐싱 (메모리에 저장, 프로세스 재시작시 리셋)
_jwks_cache: Optional[Dict[str, Any]] = None
_jwks_cache_time: Optional[datetime] = None
JWKS_CACHE_DURATION = timedelta(minutes=15)


def get_jwks() -> Dict[str, Any]:
    """
    Clerk JWKS를 가져옵니다. 15분간 캐싱됩니다.
    """
    global _jwks_cache, _jwks_cache_time

    now = datetime.now()

    # 캐시가 유효하면 캐시 반환
    if _jwks_cache and _jwks_cache_time:
        if now - _jwks_cache_time < JWKS_CACHE_DURATION:
            print(f"[DEBUG get_jwks] Using cached JWKS (age: {now - _jwks_cache_time})")
            return _jwks_cache

    # JWKS 새로 가져오기
    print(f"[DEBUG get_jwks] Fetching fresh JWKS from {settings.clerk_jwks_url}")
    try:
        response = requests.get(settings.clerk_jwks_url, timeout=5)
        response.raise_for_status()
        jwks = response.json()

        # 캐시 업데이트
        _jwks_cache = jwks
        _jwks_cache_time = now

        print(f"[DEBUG get_jwks] JWKS fetched successfully, keys count: {len(jwks.get('keys', []))}")
        return jwks
    except Exception as e:
        print(f"[ERROR get_jwks] Failed to fetch JWKS: {e}")
        # 캐시가 있으면 만료되어도 사용
        if _jwks_cache:
            print("[WARN get_jwks] Using stale cache due to fetch failure")
            return _jwks_cache
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch JWKS: {str(e)}"
        )


def verify_clerk_jwt(token: str) -> Dict[str, Any]:
    """
    Clerk JWT 토큰을 검증하고 디코딩된 페이로드를 반환합니다.

    Args:
        token: Bearer 토큰 (Bearer 접두사 제거된 상태)

    Returns:
        디코딩된 JWT 페이로드 (dict)

    Raises:
        HTTPException: JWT 검증 실패시
    """
    print(f"[DEBUG verify_clerk_jwt] Verifying token (length: {len(token)})")

    try:
        # 1. JWT 헤더에서 kid (Key ID) 추출
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        print(f"[DEBUG verify_clerk_jwt] JWT kid: {kid}")

        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWT header missing 'kid' field"
            )

        # 2. JWKS에서 해당 kid의 공개키 찾기
        jwks = get_jwks()
        key_data = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                key_data = key
                break

        if not key_data:
            print(f"[ERROR verify_clerk_jwt] No matching key for kid={kid}")
            print(f"[DEBUG verify_clerk_jwt] Available kids: {[k.get('kid') for k in jwks.get('keys', [])]}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"No matching key found for kid={kid}"
            )

        print(f"[DEBUG verify_clerk_jwt] Found matching key for kid={kid}")

        # 3. JWK를 공개키로 변환
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key_data)

        # 4. JWT 검증 및 디코딩
        # audience와 issuer 검증은 비활성화 (Clerk 기본 설정과 맞지 않을 수 있음)
        # leeway: 서버 시간 차이를 고려해 30초 여유를 줌 (iat, exp, nbf 검증시)
        decoded = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={
                "verify_aud": False,  # audience 검증 비활성화
                "verify_iss": False,  # issuer 검증 비활성화
                "verify_exp": True,   # 만료 시간은 검증
            },
            leeway=30  # 30초 여유 (시간 동기화 문제 해결)
        )

        print(f"[DEBUG verify_clerk_jwt] JWT verified successfully")
        print(f"[DEBUG verify_clerk_jwt] User ID (sub): {decoded.get('sub')}")
        print(f"[DEBUG verify_clerk_jwt] JWT claims: {list(decoded.keys())}")

        return decoded

    except jwt.ExpiredSignatureError:
        print("[ERROR verify_clerk_jwt] JWT token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT token has expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"[ERROR verify_clerk_jwt] Invalid JWT token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid JWT token: {str(e)}"
        )
    except Exception as e:
        print(f"[ERROR verify_clerk_jwt] Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT verification failed: {str(e)}"
        )


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    현재 로그인한 사용자 정보를 반환합니다.

    Args:
        authorization: Authorization 헤더 (Bearer <token>)

    Returns:
        디코딩된 JWT 페이로드
    """
    print(f"[DEBUG get_current_user] Called")
    print(f"[DEBUG get_current_user] Authorization header: {authorization[:50] if authorization else 'None'}...")

    if not authorization:
        print("[ERROR get_current_user] No Authorization header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - missing Authorization header"
        )

    # Bearer 접두사 제거
    if not authorization.startswith("Bearer "):
        print("[ERROR get_current_user] Invalid Authorization header format")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format"
        )

    token = authorization.replace("Bearer ", "", 1)

    # JWT 검증
    decoded = verify_clerk_jwt(token)

    return decoded


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    현재 로그인한 사용자의 Clerk User ID를 반환합니다.
    """
    decoded = await get_current_user(authorization)

    user_id = decoded.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )

    return user_id


async def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    """
    현재 로그인한 사용자의 이메일을 반환합니다.
    """
    decoded = await get_current_user(authorization)

    email = decoded.get("email")

    # Clerk JWT는 이메일을 email 또는 email_addresses에 포함할 수 있습니다
    if not email:
        email_addresses = decoded.get("email_addresses", [])
        if email_addresses and isinstance(email_addresses, list):
            email = email_addresses[0]

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not found in token"
        )

    return email


async def get_admin_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    현재 로그인한 사용자가 관리자인지 확인합니다.
    관리자가 아니면 403 Forbidden 에러를 발생시킵니다.
    """
    print(f"[DEBUG get_admin_user] Called")

    # JWT 검증 및 디코딩
    decoded = await get_current_user(authorization)

    # User ID로 admin 체크 (JWT "sub" 클레임)
    user_id = decoded.get("sub")
    print(f"[DEBUG get_admin_user] User ID: {user_id}")
    print(f"[DEBUG get_admin_user] Admin user IDs: {settings.admin_user_ids_list}")

    if not user_id:
        print("[ERROR get_admin_user] No user ID in token")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not found in token"
        )

    # User ID 기반 admin 체크 (우선순위)
    if settings.admin_user_ids_list and user_id in settings.admin_user_ids_list:
        print(f"[OK get_admin_user] Admin check PASSED for user_id: {user_id}")
        return decoded

    # 이메일 기반 admin 체크 (fallback, JWT에 email이 있는 경우만)
    email = decoded.get("email")
    if email:
        print(f"[DEBUG get_admin_user] Email from token: {email}")
        print(f"[DEBUG get_admin_user] Admin emails: {settings.admin_emails_list}")

        if email in settings.admin_emails_list:
            print(f"[OK get_admin_user] Admin check PASSED for email: {email}")
            return decoded

    # User ID도 이메일도 admin 목록에 없음
    print(f"[ERROR get_admin_user] User {user_id} (email: {email}) NOT in admin list!")
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Admin access required. Your user ID: {user_id}"
    )
