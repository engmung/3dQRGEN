# 3D QR 플랫폼 - AI 개발 도우미용 요약

## 프로젝트 개요
React + Three.js 기반 3D QR 코드 생성 플랫폼

## 최근 주요 구현 (2025년 1월)
- STL 기반 거치대 시스템 (5가지 각도 옵션)
- GLB 기반 3D QR 시스템 (버텍스 컬러 활용)
- 3D 텍스트/이미지 기능 (Pretendard 폰트, Marching Squares)
- OBJ Export 시스템
- 텔레그램 봇 통합 (주문 알림)
- 배송지 입력 (Daum 우편번호 API)

## 기술 스택
**Frontend**: React 19, Three.js, R3F, Zustand, Clerk, TypeScript
**Backend**: FastAPI, SQLAlchemy, SQLite, python-telegram-bot

## 코드 정리 완료 (2025-01-25)
- Phase 1: 보안, 미사용 파일 삭제, 디버깅 코드 제거 (약 600줄 감소)
- Phase 2: 개발 전용 코드 환경변수화 (DEV_MODE, DATABASE_ECHO)
- Phase 3: 중복 코드 공통화 (fetchWithRetry, alignToGround, serialize_order)
- Phase 4: imageUtils 모듈화 (5개 파일로 분리)

## 상세 정보
- **전체 프로젝트 현황**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **알려진 이슈**: [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
- **실행 방법**: PROJECT_STATUS.md 참조

## 파일 구조 (핵심만)
```
frontend/
  ├── src/components/
  │   ├── QRPlate.tsx (STL 거치대)
  │   ├── QRPlateInstance.tsx (QR/텍스트/이미지 생성)
  │   └── GLBBaseParts.tsx (GLB 로더)
  ├── src/utils/
  │   ├── imageUtils/ (이미지 3D 변환 모듈)
  │   ├── objExporter.ts (OBJ Export)
  │   ├── meshCollector.ts (메시 수집)
  │   └── api.ts (백엔드 API)
  └── public/stands/ (STL 거치대 파일)

backend/
  ├── app/routers/orders.py (주문 API)
  ├── app/services/telegram.py (텔레그램 알림)
  └── storage/orders/ (주문별 파일)
```

## 환경 변수
**Backend**: DATABASE_URL, CLERK_JWKS_URL, TELEGRAM_BOT_TOKEN, DATABASE_ECHO
**Frontend**: VITE_CLERK_PUBLISHABLE_KEY, VITE_API_BASE_URL, VITE_DEV_MODE

## 알려진 제한사항
1. 폰트 로딩 실패 시 Ctrl+Shift+R 필요 (개발 환경)
2. OBJ Export 시 블렌더 "Merge by Distance" 필수 (중복 정점 제거)
3. 거치대 STL 파일 수동 배치 필요
