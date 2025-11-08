# 프론트엔드 리팩토링 마스터 플랜

> **작성일**: 2025-01-08
> **목적**: 프론트엔드 코드 품질 개선, 중복 제거, 확장성 향상
> **총 예상 시간**: 40-50 시간
> **병렬 작업 가능**: 5개 작업 그룹으로 분할

---

## 📊 현황 분석

### 전체 통계
- **총 파일 수**: 63개 (TypeScript/TSX)
- **총 코드 라인**: 약 10,000+ 라인
- **주요 문제점**:
  - 중복 코드 (OBJ 생성 로직 2벌, QR 생성 로직 중복 등)
  - 거대 컴포넌트 (LeftPanel 603줄, RightPanel 599줄, QRPlateInstance 530줄)
  - 거대 페이지 (Admin 1,325줄, AddressForm 779줄, ColorPalette 712줄)
  - 하드코딩된 상수 (배송비 5000원 10곳, 색상값 수십 곳, 크기값 반복)
  - 인라인 스타일 과다 (거의 모든 컴포넌트)

### 카테고리별 복잡도

| 카테고리 | 파일 수 | 총 라인 | 평균 복잡도 | 우선순위 |
|----------|---------|---------|-------------|----------|
| Components | 30개 | ~5,000줄 | ★★★★☆ | 1 (최고) |
| Pages | 4개 | ~2,500줄 | ★★★★★ | 1 (최고) |
| Utils | 12개 | ~2,500줄 | ★★★☆☆ | 2 (높음) |
| Store/Hooks | 5개 | ~770줄 | ★★★☆☆ | 3 (중간) |
| Styles | 4개 | ~100줄 | ★☆☆☆☆ | 4 (낮음) |

---

## 🎯 리팩토링 목표

### 정량적 목표
- [ ] 코드 라인 수 30% 감소 (10,000줄 → 7,000줄)
- [ ] 파일당 평균 라인 수 200줄 이하
- [ ] 중복 코드 90% 제거
- [ ] 하드코딩된 상수 100% 제거

### 정성적 목표
- [ ] 컴포넌트별 단일 책임 원칙 준수
- [ ] 재사용 가능한 공통 컴포넌트 라이브러리 구축
- [ ] 일관된 스타일 시스템 구축
- [ ] 타입 안정성 강화 (any 제거)

---

## 📦 작업 그룹 분할 (병렬 작업 가능)

### 🟦 Group A: 상수 및 유틸리티 통합 (독립 작업)
**예상 시간**: 6-8시간
**의존성**: 없음 (가장 먼저 시작 가능)
**담당 에이전트**: Agent-A

#### A-1. 상수 파일 생성
- [ ] `frontend/src/constants/dimensions.ts` 생성
  - STAND, CARD, QR, TEXT, IMAGE 크기 상수
  - GEOMETRY 관련 상수 (CURVE_SEGMENTS 등)
- [ ] `frontend/src/constants/colors.ts` 생성
  - 디자인 토큰 (PRIMARY, SECONDARY, BACKGROUND 등)
  - 상태별 색상 (STATUS_COLORS)
- [ ] `frontend/src/constants/pricing.ts` 생성
  - SHIPPING_FEE 통합 (현재 10곳에 분산)
  - 기본 가격 정의
- [ ] `frontend/src/constants/camera.ts` 생성
  - PC/Mobile 카메라 설정
- [ ] `frontend/src/constants/breakpoints.ts` 생성
  - 반응형 breakpoint 통합
- [ ] `frontend/src/constants/storage.ts` 생성
  - localStorage 키 통합

**영향 받는 파일**: 전체 (약 40개 파일)

#### A-2. OBJ 생성 로직 통합 (중복 제거)
- [ ] `objExporter.ts` + `objGenerator.ts` 통합
  - **현재**: 446줄 + 230줄 = 676줄
  - **목표**: 단일 파일 400줄 (약 40% 감소)
  - 통합 파일명: `frontend/src/utils/obj/objExport.ts`
- [ ] OBJ/MTL 생성 로직 공통 함수 추출
  - `generateOBJString(meshes: CollectedMesh[]): string`
  - `generateMTLString(materials: Map<string, Material>): string`
  - `createOBJBlob(objString, mtlString): { obj: Blob, mtl: Blob }`
- [ ] CollectedMesh 타입을 별도 파일로 분리
  - `frontend/src/types/mesh.ts`

**결과**: 약 280줄 감소, 중복 100% 제거

#### A-3. QR 유틸리티 통합
- [ ] `qrHelpers.ts` + `qrUtils.ts` + `qrGenerator.ts` 통합
  - **현재**: 14줄 + 33줄 + 108줄 = 155줄
  - **목표**: `frontend/src/utils/qr/index.ts` (130줄)
- [ ] 구조:
  ```typescript
  // utils/qr/index.ts
  export * from './generator';
  export * from './bitmap';
  export * from './helpers';
  ```

#### A-4. API 파일 도메인별 분리
- [ ] `api.ts` (758줄) 분할
  - `frontend/src/api/orders.ts` (주문 관련 API)
  - `frontend/src/api/pricing.ts` (가격 관련 API)
  - `frontend/src/api/schedule.ts` (생산 일정 API)
  - `frontend/src/api/colors.ts` (색상 팔레트 API)
  - `frontend/src/api/auth.ts` (인증 관련 공통)
  - `frontend/src/api/index.ts` (재수출)
- [ ] 공통 로직 추출
  - `createAuthHeaders()` 함수
  - `apiRequest()` 래퍼 함수

**결과**: 758줄 → 약 600줄 (5개 파일), 가독성 대폭 향상

#### A-5. 유틸리티 함수 추가
- [ ] `frontend/src/utils/validation.ts`
  - `clampQuantity(qty: number): number`
  - `canCancelOrder(status: string): boolean`
  - `validateEmail(email: string): boolean`
  - `validatePhone(phone: string): boolean`
- [ ] `frontend/src/utils/formatters.ts`
  - `formatPrice(price: number): string`
  - `formatDate(date: Date): string`
  - `formatDateShort(date: Date): string`
  - `formatPhone(phone: string): string`
- [ ] `frontend/src/utils/geometry.ts`
  - `cloneGeometries(geos: CartItem['geometries']): ...`
  - `disposeGeometry(geo: BufferGeometry): void`

---

### 🟩 Group B: 공통 UI 컴포넌트 라이브러리 (독립 작업)
**예상 시간**: 10-12시간
**의존성**: Group A 완료 후 (상수 필요)
**담당 에이전트**: Agent-B

#### B-1. 기본 UI 컴포넌트
- [ ] `frontend/src/components/common/Button.tsx`
  - variant: primary, secondary, danger, ghost
  - size: sm, md, lg
  - 호버 효과 내장
  - 로딩 상태 지원
- [ ] `frontend/src/components/common/Modal.tsx`
  - 오버레이 + 컨테이너
  - 외부 클릭 닫기
  - 드래그 지원 옵션
  - z-index 관리
- [ ] `frontend/src/components/common/LoadingOverlay.tsx`
  - 스피너 + 텍스트
  - backdrop 옵션
- [ ] `frontend/src/components/common/InfoBox.tsx`
  - variant: info, warning, error, success
  - 아이콘 + 텍스트

#### B-2. 폼 관련 컴포넌트
- [ ] `frontend/src/components/common/FormField.tsx`
  ```tsx
  <FormField
    label="이름"
    value={name}
    onChange={setName}
    placeholder="홍길동"
    helperText="실명을 입력하세요"
    error={nameError}
    required
  />
  ```
- [ ] `frontend/src/components/common/FormSelect.tsx`
- [ ] `frontend/src/components/common/FormTextarea.tsx`
- [ ] `frontend/src/components/common/RangeSlider.tsx`
  ```tsx
  <RangeSlider
    label="QR 크기"
    value={qrSize}
    onChange={setQrSize}
    min={20}
    max={60}
    step={1}
    unit="mm"
  />
  ```

#### B-3. 색상 관련 컴포넌트
- [ ] `frontend/src/components/common/ColorButton.tsx`
  - 원형 색상 버튼
  - 선택 상태 표시
  - 크기 옵션
- [ ] `frontend/src/components/common/ColorPreview.tsx`
  - 색상 미리보기 블록
  - 텍스트 레이블
- [ ] `frontend/src/components/common/CopyButton.tsx`
  - 클립보드 복사
  - 복사 완료 피드백

#### B-4. 데이터 표시 컴포넌트
- [ ] `frontend/src/components/common/ProgressBar.tsx`
  - 퍼센티지 기반 색상
  - 라벨 표시 옵션
- [ ] `frontend/src/components/common/Badge.tsx`
  - 상태 배지
  - 색상 variant
- [ ] `frontend/src/components/common/PriceBreakdown.tsx`
  ```tsx
  <PriceBreakdown
    items={[
      { label: '제품 합계', amount: 45000 },
      { label: '배송비', amount: 5000 },
    ]}
    total={50000}
  />
  ```

---

### 🟨 Group C: 대형 컴포넌트 분할 (Group A, B 완료 후)
**예상 시간**: 12-15시간
**의존성**: Group A (상수), Group B (공통 컴포넌트)
**담당 에이전트**: Agent-C

#### C-1. LeftPanel 분할 (603줄 → ~300줄)
- [ ] `frontend/src/components/panels/LeftPanel/index.tsx`
  - 탭 전환 로직만
- [ ] `frontend/src/components/panels/LeftPanel/QRTab.tsx`
  - QR 타입 선택, URL/WiFi/Email 폼
  - QR 크기/위치 슬라이더
- [ ] `frontend/src/components/panels/LeftPanel/TextTab.tsx`
  - 텍스트 입력, 폰트 선택
  - 텍스트 크기/위치 슬라이더
- [ ] `frontend/src/components/panels/LeftPanel/ImageTab.tsx`
  - 이미지 업로드, 프리셋 선택
  - 이미지 크기/위치 슬라이더
- [ ] `frontend/src/components/panels/LeftPanel/CardSizeSettings.tsx`
  - 명함 크기 설정 (productType === 'card')
- [ ] `frontend/src/components/panels/LeftPanel/PresetImageGrid.tsx`
  - 프리셋 이미지 그리드 (현재 100줄)

#### C-2. RightPanel 분할 (599줄 → ~300줄)
- [ ] `frontend/src/components/panels/RightPanel/index.tsx`
  - 전체 레이아웃
- [ ] `frontend/src/components/panels/RightPanel/QRPreview.tsx`
  - QR 미리보기 (현재 내부 컴포넌트)
- [ ] `frontend/src/components/panels/RightPanel/PlateCard.tsx`
  - 개별 판 카드
- [ ] `frontend/src/components/panels/RightPanel/PlateControls.tsx`
  - 수량 조절, 복사, 삭제 버튼
- [ ] `frontend/src/components/panels/RightPanel/TotalSummary.tsx`
  - 총 금액 요약 (배송비 포함)

#### C-3. QRPlateInstance 리팩토링 (530줄 → ~350줄)
- [ ] 위치 계산 로직 분리
  - `frontend/src/utils/position/positionCalculator.ts`
  - `calculateQuaternion(normal, upVector)`
  - `calculateRightVector(upVector, normal)`
  - `clampOffset(offset, config, elementSize)`
  - `calculatePosition(region, offset, ...)`
- [ ] Geometry 생성 커스텀 훅
  - `frontend/src/hooks/useQRGeometry.ts`
  - `frontend/src/hooks/useTextGeometry.ts`
  - `frontend/src/hooks/useImageGeometries.ts`
- [ ] 메인 컴포넌트 간소화
  - 위치 계산 로직 → 유틸 함수
  - Geometry 생성 → 커스텀 훅

---

### 🟧 Group D: 페이지 컴포넌트 리팩토링 (Group A, B, C 완료 후)
**예상 시간**: 8-10시간
**의존성**: Group A, B, C
**담당 에이전트**: Agent-D

#### D-1. Admin 페이지 분할 (1,325줄 → ~400줄)
- [ ] `frontend/src/pages/Admin/index.tsx`
  - 탭 라우팅, 권한 체크만
- [ ] `frontend/src/components/admin/OrderManagement.tsx`
  - 주문 목록, 필터링, 정렬
  - 상태 변경, 삭제 (약 600줄)
- [ ] `frontend/src/components/admin/PricingSettings.tsx`
  - 가격 설정 UI (약 150줄)
- [ ] `frontend/src/components/admin/ColorSettings.tsx`
  - 색상 팔레트 + 조합 편집 (약 200줄)
- [ ] `frontend/src/components/admin/OrderDetailModal.tsx`
  - 주문 상세 모달 (Admin + MyOrders 공통)
  - isAdmin prop으로 기능 분기

#### D-2. AddressForm 분할 (779줄 → ~400줄)
- [ ] `frontend/src/components/order/AddressForm/index.tsx`
  - 전체 레이아웃
- [ ] `frontend/src/components/order/AddressForm/CustomerInfoFields.tsx`
  - 이름, 전화번호 입력
- [ ] `frontend/src/components/order/AddressForm/AddressFields.tsx`
  - 우편번호, 주소, 상세주소
- [ ] `frontend/src/components/order/AddressForm/OrderSummary.tsx`
  - 주문 내역 요약
- [ ] `frontend/src/components/order/AddressForm/BankAccountInfo.tsx`
  - 계좌 정보 (복사 버튼 포함)
- [ ] `frontend/src/components/order/AddressSearchModal.tsx`
  - Daum 우편번호 검색 모달

#### D-3. ColorPalette 분할 (712줄 → ~350줄)
- [ ] `frontend/src/components/color/ColorPalette/index.tsx`
  - 전체 레이아웃
- [ ] `frontend/src/components/color/ColorDropdown.tsx`
  - 색상 선택 드롭다운 (재사용 가능)
- [ ] `frontend/src/components/color/ColorPickerModal.tsx`
  - HexColorPicker 모달 (드래그 가능)
- [ ] `frontend/src/utils/colorValidator.ts`
  - 색상 조합 검증 로직 분리

#### D-4. MyOrders 정리
- [ ] OrderDetailModal 공통 컴포넌트 사용
- [ ] 모바일/데스크톱 레이아웃 분리
  - `frontend/src/components/orders/MobileOrderCard.tsx`
  - `frontend/src/components/orders/OrderTableRow.tsx`

#### D-5. Home 페이지 정리
- [ ] `handleOrderSubmit` 함수 분리
  - `validateOrder(plates, gltfs): boolean`
  - `prepareOrderData(plates, ...): OrderData`
  - `submitOrder(orderData): Promise<void>`
- [ ] HomeDebug 중복 로직 제거
  - OBJ Export 로직을 커스텀 훅으로
  - `frontend/src/hooks/useOBJExport.ts`

---

### 🟪 Group E: 스토어 및 스타일 시스템 (Group A 완료 후)
**예상 시간**: 6-8시간
**의존성**: Group A (상수)
**담당 에이전트**: Agent-E

#### E-1. useDesignStore 분할 (428줄 → ~250줄)
- [ ] `frontend/src/store/design/usePlateStore.ts`
  - 플레이트 CRUD (추가, 삭제, 복사, 선택)
  - 위치, 크기, 수량 관리
- [ ] `frontend/src/store/design/useQRConfigStore.ts`
  - QR 타입, URL, WiFi, Email 설정
  - QR 크기, 위치, 두께
- [ ] `frontend/src/store/design/useVisualConfigStore.ts`
  - 색상 (판, QR, 배경)
  - 텍스트, 이미지 설정
- [ ] 타입 분리
  - `frontend/src/types/design.ts`
  - QRPlateConfig, ImageConfig 등

#### E-2. File 직렬화 로직 분리
- [ ] `frontend/src/utils/storage/fileStorageAdapter.ts`
  - `fileToDataURL(file: File): Promise<string>`
  - `dataURLtoFile(dataUrl: string, filename: string): File`
  - `serializeImages(images: ImageConfig[]): string`
  - `deserializeImages(json: string): ImageConfig[]`

#### E-3. 스타일 시스템 구축
- [ ] `frontend/src/styles/tokens.ts`
  ```typescript
  export const tokens = {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4A90E2',
      success: '#4CAF50',
      danger: '#f44336',
      // ... (constants/colors.ts 기반)
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      xxl: '24px',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '50%',
    },
    zIndex: {
      dropdown: 10,
      modal: 1000,
      mobileModal: 10000,
      overlay: 2000,
    },
  };
  ```
- [ ] `frontend/src/styles/mixins.ts`
  - `mobileTextShadow()` (현재 여러 곳에 중복)
  - `buttonHoverEffect()`
  - `cardStyle()`

#### E-4. objPreviewStore 정리
- [ ] 기본값을 외부 설정 파일로
  - `frontend/src/config/objExportDefaults.ts`
- [ ] Transform 업데이트 함수 통합 (현재 4개 중복)
  - 제네릭 팩토리 함수

---

## 📅 실행 계획 (병렬 작업)

### Week 1: 기초 작업
```
Day 1-2: Group A-1, A-2, A-3 (상수 + OBJ 통합)
         → Agent-A

Day 2-3: Group B-1, B-2 (공통 UI 컴포넌트)
         → Agent-B (Group A-1 완료 후)

Day 3-4: Group A-4, A-5 (API 분리 + 유틸리티)
         → Agent-A
```

### Week 2: 컴포넌트 리팩토링
```
Day 5-6: Group C-1 (LeftPanel 분할)
         → Agent-C

Day 6-7: Group C-2 (RightPanel 분할)
         → Agent-C

Day 5-7: Group B-3, B-4 (색상/데이터 컴포넌트)
         → Agent-B (병렬)

Day 7-8: Group C-3 (QRPlateInstance)
         → Agent-C
```

### Week 3: 페이지 및 스토어
```
Day 8-9:  Group D-1 (Admin 분할)
          → Agent-D

Day 9-10: Group D-2 (AddressForm 분할)
          → Agent-D

Day 8-10: Group E-1, E-2 (스토어 분할)
          → Agent-E (병렬)

Day 10:   Group D-3, D-4 (ColorPalette, MyOrders)
          → Agent-D
```

### Week 4: 마무리
```
Day 11: Group D-5 (Home/HomeDebug)
        → Agent-D

Day 11: Group E-3, E-4 (스타일 시스템)
        → Agent-E (병렬)

Day 12: 통합 테스트 및 버그 수정
Day 13: 코드 리뷰 및 문서화
```

---

## ✅ 체크리스트

### Group A: 상수 및 유틸리티
- [ ] dimensions.ts 생성
- [ ] colors.ts 생성
- [ ] pricing.ts 생성
- [ ] camera.ts 생성
- [ ] breakpoints.ts 생성
- [ ] storage.ts 생성
- [ ] objExporter + objGenerator 통합
- [ ] QR 유틸리티 통합
- [ ] API 파일 5개로 분할
- [ ] validation.ts 생성
- [ ] formatters.ts 생성
- [ ] geometry.ts 생성

### Group B: 공통 UI 컴포넌트
- [ ] Button.tsx
- [ ] Modal.tsx
- [ ] LoadingOverlay.tsx
- [ ] InfoBox.tsx
- [ ] FormField.tsx
- [ ] FormSelect.tsx
- [ ] FormTextarea.tsx
- [ ] RangeSlider.tsx
- [ ] ColorButton.tsx
- [ ] ColorPreview.tsx
- [ ] CopyButton.tsx
- [ ] ProgressBar.tsx
- [ ] Badge.tsx
- [ ] PriceBreakdown.tsx

### Group C: 대형 컴포넌트 분할
- [ ] LeftPanel → 6개 파일
- [ ] RightPanel → 5개 파일
- [ ] QRPlateInstance → 유틸 + 훅 분리

### Group D: 페이지 리팩토링
- [ ] Admin → 5개 컴포넌트
- [ ] AddressForm → 6개 컴포넌트
- [ ] ColorPalette → 4개 컴포넌트
- [ ] MyOrders → 공통 컴포넌트 활용
- [ ] Home/HomeDebug → 로직 정리

### Group E: 스토어 및 스타일
- [ ] useDesignStore → 3개 스토어
- [ ] File 직렬화 분리
- [ ] tokens.ts 생성
- [ ] mixins.ts 생성
- [ ] objPreviewStore 정리

---

## 🎁 예상 효과

### 정량적 효과
| 항목 | Before | After | 감소율 |
|------|--------|-------|--------|
| 총 코드 라인 | ~10,000줄 | ~7,000줄 | 30% ↓ |
| 최대 파일 크기 | 1,325줄 | ~400줄 | 70% ↓ |
| 평균 파일 크기 | ~270줄 | ~150줄 | 45% ↓ |
| 중복 코드 | ~1,500줄 | ~150줄 | 90% ↓ |
| 하드코딩 상수 | ~200개 | 0개 | 100% ↓ |

### 정성적 효과
- ✅ **유지보수성**: 파일 크기 감소로 코드 파악 용이
- ✅ **재사용성**: 공통 컴포넌트 15개+ 생성
- ✅ **확장성**: 새 기능 추가 시 기존 컴포넌트 활용
- ✅ **일관성**: 통일된 스타일 시스템 및 네이밍
- ✅ **테스트 용이성**: 작은 단위로 분할되어 테스트 가능
- ✅ **협업 효율성**: 파일 충돌 감소, 병렬 작업 가능

---

## 🚨 주의사항

### 병렬 작업 시 주의할 점
1. **Group A 우선**: 상수 파일은 모든 그룹에서 사용하므로 최우선 완료
2. **타입 충돌 방지**: 타입 정의를 먼저 확정하고 시작
3. **import 경로 일관성**: `@/` alias 사용 규칙 통일
4. **커밋 단위**: 각 서브태스크마다 커밋하여 충돌 방지
5. **테스트**: 각 그룹 완료 시 기능 테스트 필수

### 롤백 계획
- 각 그룹마다 별도 브랜치 생성 권장
  - `refactor/group-a-constants`
  - `refactor/group-b-components`
  - `refactor/group-c-panels`
  - `refactor/group-d-pages`
  - `refactor/group-e-store`
- 메인 브랜치 병합 전 통합 테스트

### 마이그레이션 가이드
- 각 그룹 완료 시 CHANGELOG 작성
- Breaking Changes 문서화
- 기존 코드 → 새 코드 매핑 테이블 작성

---

## 📝 다음 단계

1. **계획 리뷰**: 이 문서를 검토하고 누락된 부분 확인
2. **우선순위 확정**: 시급한 그룹부터 시작 (Group A → B → C → D → E)
3. **에이전트 할당**: 각 그룹에 담당 에이전트 배정
4. **브랜치 생성**: 그룹별 브랜치 생성
5. **작업 시작**: Group A부터 병렬로 진행

---

**작성자**: Claude Code
**승인 대기**: 사용자 확인 필요
**예상 완료일**: 2025-01-21 (2주)
