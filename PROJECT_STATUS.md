# 3D QR 생성 플랫폼 프로젝트 현황

## 📋 프로젝트 개요
- **프로젝트명**: 3D QR 코드 생성 및 주문 플랫폼
- **기술 스택**:
  - Frontend: React + TypeScript + Three.js + Vite
  - Backend: FastAPI + SQLAlchemy + SQLite
  - 인증: Clerk (JWT)
  - 3D: Three.js + STL Exporter

## ✅ 구현 완료된 기능

### 1. 사용자 인증 (Clerk)
- **파일**: `frontend/src/main.tsx`
- Clerk 기반 소셜 로그인 구현
- JWT 토큰 기반 인증
- 사용자 정보 자동 수집 (이메일, 이름)

### 2. 3D QR 코드 생성
**관련 파일**:
- `frontend/src/components/QRPlate.tsx` - QR 판 3D 모델 생성
- `frontend/src/utils/qrUtils.ts` - QR 비트맵 생성
- `frontend/src/components/Scene3D.tsx` - Three.js 씬 렌더링

**기능**:
- URL 입력 시 QR 코드 자동 생성
- QR 블록을 3D 메쉬로 변환 (검은 픽셀 → 3D 박스)
- 실시간 3D 프리뷰
- OrbitControls로 자유롭게 회전/확대 가능

### 3. 디자인 커스터마이징
**관련 파일**:
- `frontend/src/store/useDesignStore.ts` - Zustand 상태 관리
- `frontend/src/components/ControlPanel.tsx` - 디자인 설정 UI

**커스터마이징 옵션**:
- 판 크기 (너비, 높이, 두께)
- QR 크기
- QR 높이 (돌출 깊이)
- QR Y축 오프셋 (위치 조정)
- 거치대 종류 선택 (3가지 크기)

### 4. STL 파일 변환 및 다운로드
**관련 파일**:
- `frontend/src/utils/stlExporter.ts` - STL 변환 로직
- `backend/app/routers/orders.py` - 주문 API

**기능**:
- **QR 판 + QR 블록만** STL 변환 (거치대 제외)
- Binary STL 포맷으로 변환 (파일 크기 최적화)
- Z축 180도 회전하여 3D 프린팅 최적화
- 로컬 다운로드 + 백엔드 자동 업로드

### 5. 주문 시스템
**관련 파일**:
- `backend/app/routers/orders.py` - 주문 API
- `backend/app/models.py` - Order 모델
- `backend/app/database.py` - SQLite 연결
- `frontend/src/utils/api.ts` - API 클라이언트

**기능**:
- 주문 생성 시 STL 파일 자동 업로드
- UUID 기반 주문 번호 생성
- 주문 정보 자동 저장:
  - 사용자 정보 (이메일, 이름)
  - 디자인 파라미터
  - STL 파일 경로
  - QR URL
  - 거치대 종류
- 주문 상태 관리 (pending, processing, completed, cancelled)

### 6. 관리자 페이지
**관련 파일**:
- `frontend/src/pages/Admin.tsx` - 관리자 대시보드
- `backend/app/routers/orders.py` - 관리자 API
- `backend/app/auth.py` - JWT 인증 및 관리자 권한 체크

**기능**:
- **Clerk JWT 인증 완료** (PyJWT + RS256)
- 전체 주문 목록 조회
- 주문 상태 변경 (완료/취소)
- 개별 주문 삭제
- **일괄 삭제 기능**:
  - 체크박스로 다중 선택
  - "전체 선택/전체 해제" 버튼
  - "선택 삭제 (N개)" 버튼
  - 성공/실패 카운트 표시
- 주문 상세 정보 표시:
  - 주문 번호 (UUID)
  - 사용자 정보
  - QR URL
  - 디자인 파라미터
  - STL 파일 다운로드
  - 주문 날짜

### 7. 백엔드 인증 시스템
**관련 파일**:
- `backend/app/auth.py` - 완전히 새로 구현
- `backend/requirements.txt` - PyJWT 사용

**구현 내용**:
- `fastapi-clerk-auth` 제거 → **PyJWT 직접 구현**
- Clerk JWKS 자동 페칭 (15분 캐싱)
- RS256 서명 검증
- JWT `leeway=30` 설정 (시간 동기화 문제 해결)
- 관리자 권한 체크 (user_id 기반)
- 보안 강화:
  - `/api/orders/list` - 관리자 전용
  - `/api/orders/{uuid}/status` - 관리자 전용
  - `/api/orders/{uuid}` DELETE - 관리자 전용

### 8. 파일 저장 시스템
**관련 파일**:
- `backend/app/routers/orders.py:48-78` - 파일 업로드 처리

**기능**:
- STL 파일 저장 경로: `./storage/orders/{order_uuid}.stl`
- 자동 디렉토리 생성
- 파일 덮어쓰기 방지

## 🔧 기술적 해결 사항

### 1. Clerk JWT 인증 문제 해결
**문제**: `fastapi-clerk-auth` 라이브러리에서 JWT 검증 실패
**해결**:
- PyJWT + cryptography로 완전히 새로 구현
- JWKS 수동 페칭 및 RS256 검증
- `leeway=30` 추가로 시간 동기화 문제 해결

### 2. 다중 백엔드 서버 문제
**문제**: 코드 변경이 반영 안 됨 (여러 Python 프로세스 실행 중)
**해결**: `taskkill //F //IM python.exe`로 모든 프로세스 종료 후 재시작

### 3. STL 변환 시 거치대 포함 문제
**문제**: STL 파일에 거치대까지 포함됨
**해결**:
- `plateGroupRef` 분리 (QR 판 + QR 블록만)
- 거치대는 화면 표시용으로만 사용
- STL 변환 시 `plateGroupRef`만 export

## 📁 프로젝트 구조

```
3D_QR_생성/
├── frontend/                    # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scene3D.tsx      # Three.js 메인 씬
│   │   │   ├── QRPlate.tsx      # QR 판 3D 모델
│   │   │   └── ControlPanel.tsx # 디자인 설정 패널
│   │   ├── pages/
│   │   │   ├── Home.tsx         # 메인 페이지
│   │   │   └── Admin.tsx        # 관리자 페이지 (인증 완료)
│   │   ├── store/
│   │   │   └── useDesignStore.ts # Zustand 상태 관리
│   │   ├── utils/
│   │   │   ├── qrUtils.ts       # QR 비트맵 생성
│   │   │   ├── stlExporter.ts   # STL 변환
│   │   │   └── api.ts           # 백엔드 API 클라이언트
│   │   └── main.tsx             # Clerk Provider
│   └── package.json
│
├── backend/                     # FastAPI
│   ├── app/
│   │   ├── main.py              # FastAPI 앱
│   │   ├── auth.py              # JWT 인증 (PyJWT)
│   │   ├── models.py            # Order 모델
│   │   ├── database.py          # SQLite 연결
│   │   └── routers/
│   │       └── orders.py        # 주문 API (관리자 인증 완료)
│   ├── .env                     # 환경 변수 (ADMIN_USER_IDS)
│   ├── requirements.txt         # PyJWT, cryptography, requests
│   └── qr_platform.db           # SQLite DB
│
└── storage/                     # 업로드 파일 저장소
    └── orders/
        └── {order_uuid}.stl
```

## 🔑 환경 변수 설정

### Backend (`.env`)
```env
ADMIN_USER_IDS=user_34QrYZsLdUnxaKYTBMGH5xLPFdi
CLERK_JWKS_URL=https://neutral-grizzly-76.clerk.accounts.dev/.well-known/jwks.json
```

### Frontend (`.env.local`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:8000
```

## 📊 데이터베이스 스키마

### `orders` 테이블
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_uuid TEXT UNIQUE NOT NULL,           -- UUID v4
    user_email TEXT NOT NULL,                  -- Clerk 이메일
    user_name TEXT,                            -- Clerk 이름
    user_address TEXT,                         -- 배송 주소 (추후 추가)
    stand_id INTEGER NOT NULL,                 -- 거치대 종류 (1-3)
    qr_url TEXT NOT NULL,                      -- QR 코드 URL
    design_params TEXT,                        -- JSON 형태 디자인 파라미터
    stl_file_path TEXT,                        -- STL 파일 경로
    status TEXT DEFAULT 'pending',             -- pending/processing/completed/cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 실행 방법

### Backend
```bash
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

### 접속 URL
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin: http://localhost:5173/admin

---

## 📝 앞으로 해야 할 일

### 1. 결제 시스템 통합 🔴 우선순위 높음
**필요성**: 실제 서비스 운영을 위한 필수 기능
**구현 방안**:
- [ ] 토스페이먼츠 또는 카카오페이 연동
- [ ] 주문 생성 전 결제 진행
- [ ] 결제 완료 후 주문 생성
- [ ] 결제 실패 시 롤백 처리
- [ ] 환불 기능

**관련 파일**:
- `frontend/src/components/PaymentModal.tsx` (신규)
- `backend/app/routers/payments.py` (신규)
- `backend/app/models.py` - Payment 모델 추가

### 2. 배송 주소 입력 🔴 우선순위 높음
**필요성**: 실물 제품 배송을 위한 필수 정보
**구현 방안**:
- [ ] 주문 시 배송지 입력 폼 추가
- [ ] 우편번호 검색 API 연동 (Daum 우편번호 서비스)
- [ ] 주소 유효성 검증
- [ ] DB에 주소 정보 저장
- [ ] 관리자 페이지에서 주소 확인 가능

**관련 파일**:
- `frontend/src/components/AddressForm.tsx` (신규)
- `backend/app/models.py` - user_address 필드 활용

### 3. 이메일 알림 시스템 🟡 우선순위 중간
**필요성**: 고객 경험 개선 및 주문 상태 자동 알림
**구현 방안**:
- [ ] 주문 완료 시 확인 이메일 발송
- [ ] 주문 상태 변경 시 알림 (제작 중, 배송 시작 등)
- [ ] 관리자에게 신규 주문 알림
- [ ] SendGrid 또는 AWS SES 연동

**관련 파일**:
- `backend/app/services/email.py` (신규)
- `backend/app/routers/orders.py` - 이메일 발송 로직 추가

### 4. 가격 책정 시스템 🟡 우선순위 중간
**필요성**: 디자인 파라미터에 따른 동적 가격 계산
**구현 방안**:
- [ ] 판 크기에 따른 기본 가격
- [ ] 거치대 종류별 추가 가격
- [ ] QR 복잡도에 따른 추가 가격 (선택적)
- [ ] 배송비 계산
- [ ] 할인 쿠폰 시스템 (선택적)

**관련 파일**:
- `backend/app/services/pricing.py` (신규)
- `frontend/src/components/PricingSummary.tsx` (신규)
- `backend/app/models.py` - Stand 모델에 가격 정보 추가

### 5. 관리자 대시보드 개선 🟡 우선순위 중간
**구현 방안**:
- [ ] 주문 통계 차트 (일별/월별)
- [ ] 매출 현황 그래프
- [ ] 주문 상태별 필터링
- [ ] 날짜 범위 검색
- [ ] 주문 엑셀 다운로드
- [ ] 고객별 주문 이력 조회

**관련 파일**:
- `frontend/src/pages/Admin.tsx` - 차트 추가
- `backend/app/routers/analytics.py` (신규)

### 6. STL 파일 검증 🟢 우선순위 낮음
**필요성**: 3D 프린팅 실패 방지
**구현 방안**:
- [ ] STL 파일 형식 검증
- [ ] 메쉬 무결성 체크 (비다양체, 홀 검사)
- [ ] 파일 크기 제한
- [ ] 프린팅 가능 여부 사전 체크

**관련 파일**:
- `backend/app/services/stl_validator.py` (신규)

### 7. 사용자 마이페이지 🟢 우선순위 낮음
**구현 방안**:
- [ ] 내 주문 내역 조회
- [ ] 주문 상태 추적
- [ ] STL 파일 재다운로드
- [ ] 이전 디자인 불러오기
- [ ] 프로필 정보 수정

**관련 파일**:
- `frontend/src/pages/MyOrders.tsx` (신규)
- `backend/app/routers/users.py` (신규)

### 8. 거치대 3D 모델 추가 🟢 우선순위 낮음
**현재 상태**: 거치대는 간단한 박스 형태로만 표시
**개선 방안**:
- [ ] 실제 거치대 디자인 3D 모델링 (.glb/.gltf)
- [ ] Three.js GLTFLoader로 불러오기
- [ ] 거치대별로 다른 모델 적용
- [ ] 거치대도 STL 변환 가능하게 (선택적)

**관련 파일**:
- `frontend/src/components/StandModel.tsx` (신규)
- `frontend/public/models/stand-1.glb` (신규)

### 9. QR 코드 스캔 테스트 기능 🟢 우선순위 낮음
**구현 방안**:
- [ ] 프리뷰 화면에서 QR 코드 스캔 시뮬레이션
- [ ] 실제 스캔 시 동작 확인
- [ ] QR 크기/거리별 인식률 테스트

### 10. 다국어 지원 🟢 우선순위 낮음
**구현 방안**:
- [ ] react-i18next 설치
- [ ] 한국어/영어 번역 파일
- [ ] 언어 선택 UI

### 11. 서버 배포 🔴 우선순위 높음 (서비스 오픈 전)
**구현 방안**:
- [ ] Frontend: Vercel 또는 Netlify
- [ ] Backend: Railway, Fly.io, AWS EC2
- [ ] DB: PostgreSQL로 마이그레이션 (SQLite → PostgreSQL)
- [ ] 파일 저장소: AWS S3 또는 Cloudflare R2
- [ ] HTTPS 설정
- [ ] 도메인 연결

### 12. 보안 강화 🔴 우선순위 높음
**구현 방안**:
- [ ] CORS 설정 강화
- [ ] Rate Limiting (API 요청 제한)
- [ ] SQL Injection 방지 (SQLAlchemy ORM 사용 중이므로 대부분 안전)
- [ ] XSS 방지
- [ ] 파일 업로드 제한 (크기, 형식)
- [ ] 환경 변수 암호화

---

## 🎯 단계별 개발 로드맵

### Phase 1: MVP 완성 (1-2주) 🔴
1. ✅ 3D QR 생성 기능
2. ✅ STL 변환 및 다운로드
3. ✅ 주문 시스템
4. ✅ 관리자 페이지
5. ✅ Clerk 인증
6. 🔲 가격 책정 시스템
7. 🔲 배송 주소 입력

### Phase 2: 결제 및 운영 준비 (2-3주) 🟡
1. 🔲 결제 시스템 통합
2. 🔲 이메일 알림
3. 🔲 관리자 대시보드 개선
4. 🔲 사용자 마이페이지
5. 🔲 서버 배포

### Phase 3: 고도화 (1-2개월) 🟢
1. 🔲 거치대 3D 모델 개선
2. 🔲 STL 파일 검증
3. 🔲 QR 스캔 테스트 기능
4. 🔲 다국어 지원
5. 🔲 고급 분석 및 통계

---

## 📞 문의 및 지원
- 개발자: [사용자명]
- 이메일: [이메일]
- GitHub: [레포지토리 URL]

**마지막 업데이트**: 2025-10-23
