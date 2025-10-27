# 3D QR 플랫폼 개발 현황

**최종 업데이트**: 2025-01-27
**프로젝트 상태**: 🟢 활발한 개발 중
**최근 마일스톤**: 생산 일정 관리 시스템 및 주문 UI 대개편 완료

---

## 📊 프로젝트 개요

React + Three.js 기반 3D QR 코드 생성 및 주문 관리 플랫폼

### 핵심 기능
- ✅ 3D QR 코드 생성 (URL, WiFi, Email)
- ✅ 3D 텍스트 및 이미지 추가
- ✅ 실시간 3D 프리뷰 (거치대 포함)
- ✅ OBJ/MTL 파일 생성 및 다운로드
- ✅ 주문 시스템 (OrderGroup + LineItems)
- ✅ 동적 가격 책정
- ✅ **생산 일정 관리 시스템** ⭐ NEW
- ✅ 관리자 페이지 (주문 관리, 일정 관리)
- ✅ 텔레그램 알림 연동

---

## 🎯 최근 구현 사항 (2025-01-27)

### 1. 생산 일정 관리 시스템 (Backend)

#### ProductionSchedule 모델
- **날짜별 생산 용량 관리**
- `max_capacity`: 하루 최대 생산량 (기본 5개)
- `reserved_quantity`: 예약된 수량
- `is_available`: 주문 가능 여부 (기본: False)
- `available_slots`: 남은 생산 가능 개수

#### API 엔드포인트
- `GET /api/production-schedule/available` - 고객용: 주문 가능한 날짜 조회
- `GET /api/production-schedule/admin` - 관리자: 전체 일정 조회
- `POST /api/production-schedule/admin` - 관리자: 일정 생성
- `PATCH /api/production-schedule/admin/{date}` - 관리자: 일정 수정
- `DELETE /api/production-schedule/admin/{date}` - 관리자: 일정 비활성화
- `GET /api/production-schedule/admin/{date}/orders` - 관리자: 날짜별 주문 조회

#### 주요 로직
- **주문 생성 시 용량 검증**: Row-level locking으로 동시성 문제 해결
- **자동 예약량 관리**: 주문 생성 시 reserved_quantity 증가, 삭제 시 감소
- **DB 초기화**: 오늘부터 60일치 일정 자동 생성 (기본: is_available=False)

---

### 2. 주문 UI 대개편 (Frontend)

#### 새 컴포넌트

**CustomerCalendar.tsx** - 고객용 캘린더 날짜 선택기
- 🟢 **초록**: 여유 있음 (0~50%)
- 🟡 **노랑**: 보통 (50~80%)
- 🔴 **빨강**: 용량 부족 (클릭 불가)
- ⚫ **회색**: 주문 불가
- 선택 피드백: 파란 테두리 + 남은 슬롯 표시
- 용량 필터링: totalQuantity에 맞는 날짜만 선택 가능

**ProductionCalendar.tsx** - 관리자용 일정 관리 캘린더
- 월별 뷰: 이전/다음 달 이동
- 날짜 클릭: 모달로 설정 편집
- 실시간 업데이트
- 주문 목록 확인

#### UI 개선

**OrderModal.tsx**
- 배경: 검정 → 흰색
- 텍스트: 흰색 → 검정
- 제품 카드: 흰 배경 + 그림자 효과
- 총 금액: 연한 파랑 배경 + 파란 테두리
- 수량 표시: "3종, 총 5개" 형태
- 모달 크기: 600px → 1200px
- 스크롤: overflowY: auto 활성화

**AddressForm.tsx**
- 레이아웃: 좌우 2단 그리드
  - 좌측: 고객 정보 입력
  - 우측: CustomerCalendar
- DateSelector 삭제 → CustomerCalendar로 대체

---

### 3. 버그 수정

#### CartItem.quantity 필드 추가
```typescript
export interface CartItem {
  id: string;
  plateConfig: QRPlateConfig;
  quantity: number; // 추가 (기본값 1)
  geometries: ...;
}
```

#### Home.tsx - OrderModal에 quantity 전달
```typescript
cartItems={plates.map(plate => ({
  id: plate.id,
  plateConfig: plate,
  quantity: plate.quantity, // 추가
  geometries: ...
}))}
```

#### fetchWithRetry 호출 방식 수정
```typescript
// Before - 잘못된 호출
const response = await fetchWithRetry(url, { method: 'GET' });

// After - 올바른 호출
const response = await fetchWithRetry(
  () => fetch(url, { method: 'GET', headers })
);
```

#### Admin 페이지 스크롤 활성화
- index.css에서 body overflow: hidden 제거
- App.tsx에서 홈 페이지만 overflow: hidden 적용

---

## 🏗️ 기술 스택

### Frontend
- React 19 + TypeScript
- Three.js + React Three Fiber
- Zustand (상태 관리)
- Clerk (인증)
- Inline Styles
- Pretendard 폰트
- Daum 우편번호 API

### Backend
- FastAPI
- SQLAlchemy (ORM)
- SQLite
- Clerk JWT 인증
- python-telegram-bot
- Local filesystem 저장소

---

## 📁 주요 파일 구조

```
backend/
  app/
    models/
      production_schedule.py  ⭐ 생산 일정 모델 (NEW)
      order_group.py          (production_date 추가)
      order_line_item.py
    routers/
      production_schedule.py  ⭐ 생산 일정 API (NEW)
      order_groups.py         (용량 검증 추가)
    database.py               (60일 일정 초기화)

frontend/
  src/
    components/
      CustomerCalendar.tsx    ⭐ 고객용 캘린더 (NEW)
      ProductionCalendar.tsx  ⭐ 관리자용 캘린더 (NEW)
      OrderModal.tsx          (UI 개편)
      AddressForm.tsx         (2단 레이아웃)
      QRPlate.tsx
      LeftPanel.tsx
      RightPanel.tsx          (수량 조절)
    pages/
      Home.tsx                (quantity 전달)
      Admin.tsx               (일정 관리 추가)
    store/
      useCartStore.ts         (quantity 추가)
    utils/
      api.ts                  (생산 일정 API 추가)
      fetchWithRetry.ts
```

---

## 🔧 환경 변수

### Backend (.env)
```
DATABASE_URL=sqlite:///./backend/data/qr_platform.db
CLERK_JWKS_URL=https://...
TELEGRAM_BOT_TOKEN=...
DATABASE_ECHO=False
```

### Frontend (.env.local)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:8000
VITE_DEV_MODE=false
```

---

## 🚀 실행 방법

### Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 접속
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs
- Admin: http://localhost:5173/admin

---

## 📝 데이터베이스 스키마

### production_schedules (새로 추가)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER | Primary Key |
| date | DATE | 생산일 (UNIQUE) |
| max_capacity | INTEGER | 최대 생산량 (기본 5) |
| reserved_quantity | INTEGER | 예약 수량 (기본 0) |
| is_available | BOOLEAN | 주문 가능 (기본 False) |

### order_groups (수정)
- production_date 필드 추가 (DATE, INDEXED)

### order_line_items
- quantity 필드 사용

---

## 🎨 UI/UX 개선

### Before (기존)
- 검정 배경 주문 모달 (글자 안 보임)
- 드롭다운 날짜 선택 (불편함)
- 세로 1단 레이아웃

### After (개선)
- 흰 배경 주문 모달 (가독성 향상)
- 캘린더 날짜 선택 (직관적)
- 좌우 2단 레이아웃
- 색상 코딩 (초록/노랑/빨강/회색)
- 수량 정보 명확히 표시

---

## ⚠️ 알려진 제한사항

1. **폰트 로딩 실패**: Ctrl+Shift+R 필요 (개발 환경)
2. **OBJ Export**: Blender "Merge by Distance" 필수
3. **생산 일정**: 관리자가 수동으로 날짜 활성화 필요

---

## 📈 다음 단계 (TODO)

### 우선순위 높음
- [ ] 주문 상태 변경 시스템
- [ ] 주문 검색/필터링
- [ ] 이메일 알림

### 우선순위 중간
- [ ] 대시보드 (통계, 매출)
- [ ] 이미지 여러 개 추가
- [ ] 거치대 각도 자동 조정

### 우선순위 낮음
- [ ] 사용자 프로필
- [ ] 결제 시스템 연동
- [ ] 배송 추적

---

## 🔄 최근 커밋

**커밋 ID**: 91f5ee9
**날짜**: 2025-01-27
**제목**: [주문 시스템] 생산 일정 관리 및 주문 UI 대개편
**통계**: +2,601줄 / -32,094줄

---

**마지막 업데이트**: 2025-01-27 06:22 KST
