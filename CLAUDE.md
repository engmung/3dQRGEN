# 3D QR 플랫폼 개발 현황

## 최근 구현 내역 (2025년 1월)

### 1. STL 기반 거치대 시스템
- **기능**: 사용자 제공 STL 파일을 사용한 각도별 거치대
- **구현 위치**: `frontend/src/components/QRPlate.tsx`
- **상세**:
  - 5가지 각도 옵션: 90°, 95°, 100°, 105°, 110°
  - STL 파일 위치: `frontend/public/stands/` (90.stl ~ 110.stl)
  - STLLoader를 사용하여 런타임에 로드
  - 판 너비(70mm 기준)에 맞춰 자동 스케일링
  - 기본 회전: X -90°, Z 90°
  - 메테리얼: QR 판과 동일한 흰색 (#ffffff)

### 2. 각도별 QR 판 자동 위치 조정
- **기능**: 거치대 각도에 따라 QR 판의 위치와 회전 자동 조정
- **구현 위치**: `frontend/src/components/QRPlate.tsx`
- **각도별 설정**:
  ```typescript
  // 회전값 (라디안)
  90°: 0
  95°: -5°
  100°: -10°
  105°: -15°
  110°: -20°

  // 위치값 (바닥면 기준, mm)
  90°:  { y: -10, z: 26 }
  95°:  { y: -10, z: 26.2 }
  100°: { y: -10, z: 26.2 }
  105°: { y: -10, z: 25.9 }
  110°: { y: -10, z: 25.5 }
  ```

### 3. QR 판 원점 변경 (바닥면 기준)
- **문제**: 판 높이 수정 시 위아래로 균등하게 늘어나 거치대 결합부가 어긋남
- **해결**: 판의 원점을 중앙에서 바닥면으로 변경
- **구현**:
  - QR 판 메시에 `position={[0, plateHeightUnits / 2, 0]}` 적용
  - QR 블록 위치 계산식 변경: `plateHeightUnits - qrSizeUnits / 2 - qrYOffsetUnits`
  - 이제 판 높이 증가 시 바닥면 고정, 위로만 성장

### 4. QR 판 디버깅 UI
- **위치**: `frontend/src/components/SidePanel.tsx`
- **제공 기능**:
  - Position Y: -50 ~ 100mm (슬라이더)
  - Position Z: -50 ~ 100mm (슬라이더)
  - 리셋 버튼으로 기본값 복원
- **상태 관리**: `frontend/src/store/useDesignStore.ts`
  - `qrPlatePositionY`, `qrPlatePositionZ`
  - `qrPlateRotationX`, `qrPlateRotationY`, `qrPlateRotationZ` (내부 사용)

### 5. 텔레그램 봇 통합
- **기능**: 주문 생성 시 자동 텔레그램 알림
- **구현 파일**:
  - `backend/app/services/telegram.py`: 알림 전송 함수
  - `backend/app/services/telegram_bot.py`: 봇 서버 (콜백 처리)
  - `backend/app/main.py`: FastAPI 시작 시 봇 자동 실행
- **알림 버튼**:
  - 💰 입금 확인: 주문 상태 → `paid`
  - ❌ 취소: 주문 상태 → `failed`
- **개선사항**:
  - BackgroundTasks를 사용하여 비동기 알림 전송
  - 로깅 추가로 디버깅 용이

### 6. 가격 계산 시스템
- **위치**: `frontend/src/utils/pricing.ts`
- **계산 방식**:
  - 기본료: 10,000원
  - 판 크기 비용: `(width * height * depth) * 0.5`
  - QR 크기 비용: `(qrSize * qrSize * qrDepth) * 1.0`
  - 거치대 각도별 추가 비용:
    - 90°: +2,000원
    - 95°: +2,500원
    - 100°: +3,000원
    - 105°: +3,500원
    - 110°: +4,000원

### 7. 주문 관리 페이지
- **MyOrders 페이지** (`frontend/src/pages/MyOrders.tsx`):
  - 사용자별 주문 목록 조회
  - 주문 상태별 필터링 (pending, paid, completed, failed)
  - 고객 주문 취소 기능 (pending 상태만)
  - STL 파일 다운로드

- **Admin 페이지** (`frontend/src/pages/Admin.tsx`):
  - 전체 주문 관리
  - 주문 상태 변경
  - 대량 삭제 기능 (체크박스 선택)
  - 배송 메시지 입력 및 전송

### 8. 배송 정보 수집
- **AddressForm 컴포넌트** (`frontend/src/components/AddressForm.tsx`):
  - Daum 우편번호 API 통합
  - 주소 입력 필드 (우편번호, 주소, 상세주소)
  - 주문 생성 시 배송 정보 함께 저장

## 기술 스택

### Frontend
- **React 18** + TypeScript
- **React Three Fiber (R3F)**: 3D 렌더링
- **Three.js**: STLLoader, BufferGeometry, 메시 조작
- **Zustand**: 상태 관리
- **Clerk**: 인증
- **React Router**: 라우팅

### Backend
- **FastAPI**: Python 웹 프레임워크
- **SQLAlchemy**: ORM
- **SQLite**: 데이터베이스
- **python-telegram-bot**: 텔레그램 봇 API
- **Pydantic**: 데이터 검증

## 데이터 모델

### Order
```python
- id: UUID (Primary Key)
- user_id: str (Clerk User ID)
- status: str (pending, paid, completed, failed)
- price: int
- created_at: datetime
- paid_at: datetime (nullable)
- completed_at: datetime (nullable)
- failed_at: datetime (nullable)
- design_params: JSON
- delivery_address: JSON
- delivery_message: str (nullable)
```

### Stand (미사용, STL 파일로 대체)
```python
- id: int
- name: str
- base_depth: float
- ledge_offset: float
- price: int
```

## 파일 구조

```
3D_QR_생성/
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── telegram.py          # 텔레그램 알림
│   │   │   └── telegram_bot.py      # 텔레그램 봇 서버
│   │   ├── models/
│   │   │   ├── order.py
│   │   │   └── stand.py
│   │   ├── routers/
│   │   │   └── orders.py
│   │   ├── auth.py
│   │   ├── config.py
│   │   └── main.py
│   ├── storage/orders/              # 주문별 STL 파일
│   └── data/qr_platform.db
├── frontend/
│   ├── public/stands/               # STL 거치대 파일
│   │   ├── 90.stl
│   │   ├── 95.stl
│   │   ├── 100.stl
│   │   ├── 105.stl
│   │   └── 110.stl
│   └── src/
│       ├── components/
│       │   ├── QRPlate.tsx          # 3D 모델 렌더링
│       │   ├── SidePanel.tsx        # 커스터마이징 UI
│       │   ├── Scene3D.tsx          # Three.js 씬 설정
│       │   ├── AddressForm.tsx      # 배송지 입력
│       │   └── Header.tsx
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── MyOrders.tsx         # 주문 조회
│       │   └── Admin.tsx            # 관리자 페이지
│       ├── store/
│       │   └── useDesignStore.ts    # 전역 상태
│       └── utils/
│           ├── api.ts
│           ├── pricing.ts
│           ├── qrUtils.ts
│           └── stlExporter.ts
└── CLAUDE.md                         # 이 파일
```

## 환경 변수

### Backend (.env)
```env
DATABASE_URL=sqlite:///./data/qr_platform.db
CLERK_SECRET_KEY=<Clerk Secret Key>
TELEGRAM_BOT_TOKEN=<Telegram Bot Token>
TELEGRAM_CHAT_ID=<Telegram Chat ID>
BANK_ACCOUNT=<은행 계좌번호>
```

### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=<Clerk Publishable Key>
VITE_API_URL=http://localhost:8000
```

## 실행 방법

### Backend
```bash
cd backend
uv venv
.venv/Scripts/activate  # Windows
uv pip install fastapi uvicorn sqlalchemy python-telegram-bot
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 주요 개선 사항

1. **STL 파일 기반 거치대**: 프로시저럴 생성 대신 사용자 제공 STL 파일 사용으로 품질 향상
2. **바닥면 기준 좌표계**: 판 높이 조절 시 일관된 거치대 결합 위치 유지
3. **자동 위치/회전 조정**: 각도별 최적 위치로 자동 배치
4. **텔레그램 자동 알림**: FastAPI 통합으로 별도 프로세스 불필요
5. **디버깅 UI**: 실시간 위치 미세 조정 가능

## 알려진 제한사항

1. STL 파일은 수동으로 `frontend/public/stands/`에 배치 필요
2. 판 너비가 70mm가 아닐 경우 거치대가 비율에 맞게 스케일링됨
3. 디버깅 슬라이더는 개발 중 사용 목적, 프로덕션에서는 제거 고려 필요

## 다음 작업 계획

- [ ] 거치대 STL 파일 최종 검증
- [ ] QR 판 위치 기본값 최종 튜닝
- [ ] 프로덕션 배포 준비
- [ ] 결제 시스템 통합 (옵션)
