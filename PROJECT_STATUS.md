# 3D QR 생성 플랫폼 프로젝트 현황

> **최종 업데이트**: 2025-01-27
> **현재 상태**: 핵심 기능 완료, 상용화 준비 단계

---

## 📋 프로젝트 개요

- **프로젝트명**: 3D QR 코드 생성 및 주문 플랫폼
- **기술 스택**:
  - **Frontend**: React 19 + TypeScript + Three.js + R3F + Vite + Zustand
  - **Backend**: FastAPI + SQLAlchemy + SQLite + python-telegram-bot
  - **인증**: Clerk (JWT)
  - **3D**: Three.js + GLB/OBJ Export

---

## ✅ 구현 완료된 기능 (최신순)

### 🖼️ 0. 다중 이미지 지원 (2025-01-27)
**파일**: `frontend/src/store/useDesignStore.ts`, `QRPlateInstance.tsx`, `LeftPanel.tsx`, `EditPanel.tsx`

**기능**:
- 각 QR 판에 여러 개의 이미지 추가 가능
- 각 이미지별 독립적인 크기/위치 조절
- 이미지별 높이 오프셋, 수평 오프셋 슬라이더
- 이미지 제거 기능
- OBJ Export에 모든 이미지 포함

**구현 상세**:
- `ImageConfig` 인터페이스 추가 (id, file, size, heightOffset, horizontalOffset)
- `QRPlateConfig.images` 배열로 변경 (기존 단일 파일 → 배열)
- `addImage()`, `removeImage()`, `updateImage()` 메서드
- 이미지별 두께(zScale) 적용
- alignToGround에서 `image_1`, `image_2` 등 partName 처리

**버그 수정**:
- globalRotation 타입 불일치 수정 (객체 `{x,y,z}` → 배열 `[x,y,z]`)
- 이미지 Export 시 NaN 오류 해결
- OrderModal 이미지 File 객체 직렬화 처리

### 🎨 1. GLB 기반 3D QR 시스템 (2025-01-23)
**파일**: `frontend/src/components/GLBBaseParts.tsx`, `QRPlateInstance.tsx`

**기능**:
- GLB 모델 기반 QR 판 시스템 (버텍스 컬러 활용)
- Region 기반 QR/텍스트/이미지 배치
- QR, 텍스트, 이미지를 독립된 Region에 배치 가능
- 실시간 3D 프리뷰

### 📐 2. STL 기반 거치대 시스템 (2025-01-23)
**파일**: `frontend/src/components/QRPlate.tsx`, `public/stands/*.stl`

**기능**:
- 5가지 각도 옵션 (0°, 30°, 45°, 60°, 90°)
- STL 파일 직접 로드
- 판 크기에 따른 자동 스케일링
- 위치 자동 정렬

**STL 파일**:
- `BASE1_stand_0deg.stl` - 평평한 거치대
- `BASE1_stand_30deg.stl` - 30도 경사
- `BASE1_stand_45deg.stl` - 45도 경사 (기본값)
- `BASE1_stand_60deg.stl` - 60도 경사
- `BASE1_stand_90deg.stl` - 수직 거치대

### ✍️ 3. 3D 텍스트 기능 (2025-01-23)
**파일**: `frontend/src/utils/fontLoader.ts`, `frontend/src/components/QRPlateInstance.tsx`

**기능**:
- Pretendard 폰트 지원 (한글/English)
- TTFLoader 기반 폰트 로딩
- TextGeometry로 3D 텍스트 생성
- 크기, 두께 조절 가능
- Promise 캐싱 및 자동 재시도 (3회, 지수 백오프)

**알려진 제한**:
- 개발 환경에서 폰트 로딩 실패 시 Ctrl+Shift+R 필요 (Vite HMR 충돌)

### 🖼️ 4. 3D 이미지 기능 (2025-01-23)
**파일**: `frontend/src/utils/imageUtils/`, `frontend/src/components/QRPlateInstance.tsx`

**기능**:
- Marching Squares 알고리즘으로 윤곽선 추출
- PNG/JPG 이미지를 3D로 변환
- ExtrudeGeometry로 2D → 3D 돌출
- 홀(hole) 지원 (Even-Odd Fill Rule)
- Catmull-Rom 스플라인으로 부드러운 곡선

**구현 상세**:
```
1. 이미지 로드 (File → HTMLImageElement)
2. Canvas API로 픽셀 추출 (400x400)
3. 흑백 이진화 (threshold: 250)
4. Marching Squares 알고리즘 (윤곽선 추출)
5. THREE.Shape 생성
6. ExtrudeGeometry (2D → 3D)
7. 홀 측면 노멀 자동 수정 (CW winding order)
```

### 📦 5. OBJ Export 시스템 (2025-01-23)
**파일**: `frontend/src/utils/objExporter.ts`, `meshCollector.ts`

**기능**:
- GLB 파츠 + QR/텍스트/이미지를 OBJ로 Export
- MTL 파일 생성 (색상 정보)
- 자동 바닥 정렬 (`alignToGround`)
- 파트별 색상 정보 유지
- Blender 호환 (Merge by Distance 0.0001 필요)

**Export 구성**:
- Front, Back, Brige (GLB 파츠)
- QR Code (BoxGeometry 배열)
- Text (TextGeometry)
- Image (ExtrudeGeometry)

### 📬 6. 텔레그램 봇 통합 (2025-01-23)
**파일**: `backend/app/services/telegram.py`, `backend/app/routers/orders.py`

**기능**:
- 신규 주문 시 텔레그램 알림
- 주문 상세 정보 전송 (URL, 커스터마이징, 배송지)
- 비동기 알림 (백그라운드 작업)

**환경 변수**:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### 🏠 7. 배송 주소 입력 (2025-01-23)
**파일**: `frontend/src/pages/AddressForm.tsx`

**기능**:
- Daum 우편번호 API 연동
- 주소 검색 및 자동 입력
- 배송 메시지 입력
- 주문 정보에 배송지 저장

### 💰 8. 가격 책정 시스템 (2025-01-23)
**파일**: `frontend/src/utils/pricing.ts`

**기능**:
- 판 크기 기반 가격 계산
- 거치대 각도별 가격
- 배송비 포함
- 실시간 가격 표시

**가격표**:
- 기본 가격: 20,000원
- 거치대 각도별: 0원 ~ 5,000원
- 배송비: 3,000원

### 👤 9. 마이페이지 (2025-01-23)
**파일**: `frontend/src/pages/MyOrders.tsx`

**기능**:
- 내 주문 내역 조회
- 주문 상태 확인
- OBJ/MTL 파일 다운로드
- 주문 상세 정보 표시

### 🔒 10. 사용자 인증 (Clerk)
**파일**: `frontend/src/main.tsx`, `backend/app/auth.py`

**기능**:
- Clerk 기반 소셜 로그인
- JWT 토큰 기반 인증
- PyJWT + RS256 서명 검증
- JWKS 자동 페칭 (15분 캐싱)
- 관리자 권한 체크 (user_id 기반)

### 👨‍💼 11. 관리자 페이지
**파일**: `frontend/src/pages/Admin.tsx`, `backend/app/routers/orders.py`

**기능**:
- 전체 주문 목록 조회
- 주문 상태 변경
- 개별/일괄 삭제
- 주문 상세 정보 표시
- OBJ 파일 다운로드

---

## 🛠️ 코드 정리 완료 (2025-01-25)

### Phase 1: 보안, 미사용 파일, 디버깅 코드 정리
- backend/.gitignore 생성 (.env 보호)
- JWT 토큰 로그 제거
- 미사용 파일 7개 삭제 (stands, webhooks, geometryUtils, stlExporter 등)
- console.log 19개 제거
- 주석 코드 6개 블록 제거
- npm 28개, pip 3개 패키지 제거

**결과**: 약 600줄 코드 감소

### Phase 2: 개발 전용 코드 환경변수화
- `VITE_DEV_MODE` 추가 (Transform 패널 제어)
- `DATABASE_ECHO` 추가 (SQL 로깅 제어)
- .env.example 파일 생성 (frontend, backend)

### Phase 3: 중복 코드 제거
- `fetchWithRetry` 유틸 생성 (API 재시도 로직 공통화)
- `alignToGround` 함수 재사용 (OBJ Export)
- `serialize_order` 헬퍼 함수 (백엔드 주문 직렬화)

**결과**: 약 100-150줄 코드 감소

### Phase 4: 구조 개선
- `imageUtils.ts` 모듈화 (489줄 → 5개 파일)
  - `polygon.ts` - 폴리곤 헬퍼
  - `pixelMap.ts` - 픽셀 처리
  - `marchingSquares.ts` - 알고리즘
  - `contours.ts` - 윤곽선 통합
  - `index.ts` - export

### Phase 5: 문서 정리
- `CLAUDE.md` 간소화 (244줄 → 56줄)
- `KNOWN_ISSUES.md` 업데이트
- `frontend/README.md` 프로젝트 맞춤 재작성

**총 효과**: 약 750-850줄 코드 감소, 유지보수성 향상

---

## 📁 프로젝트 구조

```
3D_QR_생성/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scene3D.tsx          # Three.js 메인 씬
│   │   │   ├── QRPlate.tsx          # STL 거치대 로더
│   │   │   ├── QRPlateInstance.tsx  # QR/텍스트/이미지 생성
│   │   │   ├── GLBBaseParts.tsx     # GLB 파츠 로더
│   │   │   └── EditPanel.tsx        # 디자인 설정
│   │   ├── pages/
│   │   │   ├── Home.tsx             # 메인 페이지
│   │   │   ├── Admin.tsx            # 관리자 페이지
│   │   │   ├── AddressForm.tsx      # 배송지 입력
│   │   │   └── MyOrders.tsx         # 마이페이지
│   │   ├── utils/
│   │   │   ├── imageUtils/          # 이미지 3D 변환 (모듈화)
│   │   │   ├── objExporter.ts       # OBJ Export
│   │   │   ├── meshCollector.ts     # 메시 수집
│   │   │   ├── fontLoader.ts        # 폰트 로더
│   │   │   ├── pricing.ts           # 가격 계산
│   │   │   ├── fetchWithRetry.ts    # API 재시도
│   │   │   └── api.ts               # 백엔드 API
│   │   └── store/
│   │       └── useDesignStore.ts    # Zustand 상태
│   └── public/
│       ├── stands/                  # STL 거치대 파일
│       └── models/BASE1_parts/      # GLB 파츠
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── auth.py                  # JWT 인증
│   │   ├── config.py                # 환경 변수
│   │   ├── database.py
│   │   ├── models/
│   │   │   └── order.py
│   │   ├── schemas/
│   │   │   └── order.py
│   │   ├── routers/
│   │   │   ├── orders.py            # 주문 API
│   │   │   └── downloads.py         # 다운로드 API
│   │   └── services/
│   │       └── telegram.py          # 텔레그램 알림
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
│
└── storage/orders/                  # 주문별 파일 저장
    └── {order_uuid}/
        ├── order_info.json
        ├── export.obj
        └── export.mtl
```

---

## 🔑 환경 변수 설정

### Backend (`.env`)
```env
# Database
DATABASE_URL=sqlite:///./data/qr_platform.db
DATABASE_ECHO=false

# Clerk
CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json
ADMIN_USER_IDS=user_xxx,user_yyy

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Storage
STORAGE_PATH=./storage
STATIC_PATH=./static

# CORS
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`.env.local`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_API_BASE_URL=http://localhost:8000
VITE_DEV_MODE=false
```

---

## 📊 데이터베이스 스키마

### `orders` 테이블
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_uuid TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT,

    -- 배송 정보
    delivery_name TEXT NOT NULL,
    delivery_phone TEXT NOT NULL,
    delivery_zipcode TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_address_detail TEXT,
    delivery_message TEXT,

    -- 주문 정보
    qr_url TEXT NOT NULL,
    stand_angle INTEGER NOT NULL,
    price REAL NOT NULL,

    -- 커스터마이징
    customization TEXT,                    -- JSON

    -- 파일 경로
    stl_file_path TEXT,
    obj_file_path TEXT,
    mtl_file_path TEXT,

    -- 결제 정보
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',

    -- 주문 상태
    status TEXT DEFAULT 'pending',
    download_token TEXT,

    -- 타임스탬프
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    completed_at DATETIME,
    failed_at DATETIME
);
```

---

## 🚀 실행 방법

### Backend
```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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
- My Orders: http://localhost:5173/my-orders

---

## 📝 다음 작업 계획

### 🔴 우선순위 높음 (상용화 필수)

#### 1. 가격 책정 로직 보완
**현재 상태**: 기본 가격 하드코딩
**추가/수정 필요**:
- [ ] 판 크기별 동적 가격 계산 (면적 기반)
- [ ] QR 복잡도에 따른 가격 조정
- [ ] 텍스트/이미지 개수에 따른 추가 요금
- [ ] 거치대 각도별 가격 차등화 (현재 하드코딩)
- [ ] 색상별 가격 (필라멘트 가격 차이)
- [ ] 수량 할인 (여러 판 주문 시)
- [ ] 배송비 계산 로직 (무게/크기 기반)
- [ ] 관리자 페이지에서 가격 설정 기능
- [ ] 실시간 가격 미리보기 개선

**파일**: `frontend/src/utils/pricing.ts`, `backend/app/models/pricing.py`

#### 2. 주문 시스템 보완
**현재 상태**: 기본 주문 흐름만 구현
**추가/수정 필요**:
- [ ] 주문 검증 강화 (최소/최대 크기, 필수 필드)
- [ ] 주문 수정/취소 기능
- [ ] 주문 상태 관리 개선 (상태 변경 로그)
- [ ] 파일 생성 실패 시 재시도 로직
- [ ] 주문 번호 생성 규칙 (UUID → 읽기 쉬운 형식)
- [ ] 대량 주문 지원 (10개 이상)
- [ ] 주문 만료 처리 (미결제 주문 자동 취소)
- [ ] 재고 관리 (필라멘트 색상별)
- [ ] 예상 제작 시간 표시
- [ ] 주문 확인 이메일 자동 발송

**파일**: `backend/app/routers/orders.py`, `frontend/src/components/OrderModal.tsx`

#### 3. 결제 시스템 통합
- [ ] 토스페이먼츠 또는 카카오페이 연동
- [ ] 주문 생성 전 결제 진행
- [ ] 결제 완료 후 주문 확정
- [ ] 결제 실패 시 롤백
- [ ] 결제 취소/환불 처리
- [ ] 부분 결제 지원 (선금/잔금)

#### 4. 서버 배포
- [ ] Frontend: Vercel 또는 Cloudflare Pages
- [ ] Backend: Railway/Fly.io/DigitalOcean
- [ ] DB: PostgreSQL 마이그레이션 (SQLite → PostgreSQL)
- [ ] 파일 저장: AWS S3/Cloudflare R2
- [ ] CDN 설정 (정적 파일 캐싱)
- [ ] HTTPS 인증서
- [ ] 환경 변수 관리

### 🟡 우선순위 중간

#### 5. QR 타입 확장
**현재 상태**: URL만 지원
**추가 예정**:
- [ ] WiFi QR (SSID, 비밀번호, 암호화 방식)
- [ ] 연락처 vCard
- [ ] 이메일 (mailto:)
- [ ] SMS/전화번호
- [ ] 텍스트 (자유 입력)
- [ ] GPS 좌표

#### 6. 이메일 알림 시스템
- [ ] 주문 완료 이메일 (고객)
- [ ] 주문 상태 변경 알림
- [ ] 배송 시작/완료 알림
- [ ] 관리자 신규 주문 알림
- [ ] 이메일 템플릿 디자인

#### 7. 관리자 대시보드 개선
- [ ] 주문 통계 차트 (일/주/월)
- [ ] 매출 현황 그래프
- [ ] 날짜 범위 검색
- [ ] 주문 필터링 (상태, 날짜, 고객)
- [ ] CSV Export
- [ ] 인기 QR 타입 분석

### 🟢 우선순위 낮음

#### 8. 거치대 3D 모델 개선
- [ ] 실제 거치대 디자인 GLB
- [ ] 거치대별 다른 모델
- [ ] 거치대 색상 선택

#### 9. UX/UI 개선
- [ ] 온보딩 튜토리얼
- [ ] 툴팁 추가
- [ ] 키보드 단축키
- [ ] 다크 모드

#### 10. 다국어 지원
- [ ] react-i18next
- [ ] 한국어/영어

---

## 🐛 알려진 이슈

1. **폰트 로딩 실패 (개발 환경)**
   - 증상: Vite HMR과 TTFLoader 충돌
   - 해결: Ctrl+Shift+R (하드 리프레시)
   - 프로덕션 해결: TTF → JSON 변환

2. **OBJ Export 중복 정점**
   - 증상: 비매니폴드 모서리 오류
   - 해결: Blender "Merge by Distance (0.0001)" 필요
   - 상세: [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)

---

## 📞 문의 및 지원

**마지막 업데이트**: 2025-01-27
**버전**: 1.1.0
**개발 상태**: 핵심 기능 완료, 상용화 준비 단계

**최근 변경사항**:
- ✅ 다중 이미지 지원 구현
- ✅ 이미지별 독립 제어 (크기, 위치)
- ✅ OBJ Export 다중 이미지 처리
- ✅ globalRotation 타입 버그 수정
