# 알려진 이슈 및 해결 방법

> **최근 업데이트 (2025-01-25)**: Phase 1-4 코드 정리 완료
> - 미사용 파일 삭제 (geometryUtils.ts, stlExporter.ts 등)
> - 중복 코드 제거 (fetchWithRetry, alignToGround, serialize_order 공통화)
> - imageUtils 모듈화 (5개 파일로 분리)
> - 자세한 내용은 git log 참조

---

## 1. 폰트 로딩 실패 (개발 환경)

### 증상
```
❌ Font load failed: Pretendard (한글/English) TypeError: Failed to fetch
Text geometry generation error: Error: Failed to load font after 3 attempts
```

### 원인
- **Vite HMR (Hot Module Replacement)과 TTFLoader의 충돌**
- 코드 수정 시 모듈이 재로드되면서 폰트 fetch 요청이 중단됨
- 브라우저 캐시와 개발 서버의 불일치
- Three.js TTFLoader의 오래된 XHR/fetch 방식

### 해결 방법

#### 개발 중 임시 해결 (현재 사용 중)
1. **브라우저 하드 리프레시**: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)
2. **프론트엔드 재시작**: Vite 개발 서버 종료 후 `npm run dev`

#### 근본적 해결 (프로덕션 배포 시 필요)
1. **폰트를 JSON으로 변환** (Three.js 공식 권장)
   - https://gero3.github.io/facetype.js/ 사용
   - TTF → JSON 변환 후 직접 import
   ```typescript
   import pretendardFont from '/fonts/Pretendard-Regular.json';
   const font = new Font(pretendardFont);
   ```

2. **폰트 Base64 인라인화**
   - 폰트 파일을 Base64로 변환하여 코드에 포함
   - fetch 없이 로드 가능

3. **폰트 프리로드**
   - `main.tsx`에서 앱 시작 시 미리 로드
   - 하지만 HMR 문제는 여전히 남음

### 현재 구현 상태
- **Promise 캐싱**: 동시 요청 방지 (여러 컴포넌트가 같은 폰트를 요청해도 하나의 fetch만 실행)
- **자동 재시도**: 실패 시 최대 3회 재시도 (지수 백오프: 500ms, 1000ms, 1500ms)
- **파일**: `frontend/src/utils/fontLoader.ts`

---

## 2. OBJ Export 시 중복 정점 문제 (Non-Manifold Geometry)

### 증상
- OBJ 파일을 뱀부랩 슬라이서에 import 시 **"비매니폴드 모서리"** 오류
- QR/텍스트/이미지가 중간에 끊기거나 제대로 슬라이싱 안됨
- 블렌더에서 `Merge by Distance (0.0001)` 실행 시 **약 3만~6만 개 정점 제거됨**

### 원인

#### 1. QR 코드 생성 방식
```typescript
// frontend/src/components/QRPlateInstance.tsx (line 126-162)
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    if (data[y][x]) {
      const boxGeo = new THREE.BoxGeometry(blockSize, blockSize, baseThickness);
      // 각 검은 픽셀마다 독립적인 BoxGeometry 생성
      boxMesh.position.set(posX, posY, baseThickness / 2);
      geometries.push(clonedGeo);
    }
  }
}
const merged = mergeGeometries(geometries); // 단순 병합
```

**문제점**:
- 각 QR 픽셀이 독립적인 Box로 생성됨 (수백~수천 개)
- `mergeGeometries`는 단순히 정점 배열을 합칠 뿐, **같은 위치의 정점을 병합하지 않음**
- 인접한 박스들이 같은 위치에 정점을 가지지만 **별도의 정점으로 존재** (중복)
- 결과: 비매니폴드 모서리 (2개 이상의 면이 같은 모서리를 공유)

#### 2. 텍스트 Geometry 생성 방식
```typescript
// frontend/src/components/QRPlateInstance.tsx (line 75-89)
const geometry = new TextGeometry(config.text, {
  font: font,
  size: config.textSize,
  depth: config.qrThickness,
  curveSegments: 12,
  bevelEnabled: false,
});
```

**문제점**:
- `TextGeometry`는 복잡한 곡선으로 이루어진 3D 텍스트 생성
- `curveSegments: 12`로 부드러운 곡선 생성 (정점 수 증가)
- 문자의 윤곽선이 많은 정점을 공유하지만 중복 생성됨

#### 3. 이미지 Geometry 생성 방식 (Marching Squares)
```typescript
// frontend/src/components/QRPlateInstance.tsx (line 168-207)
// frontend/src/utils/imageUtils.ts

// 1. 이미지를 픽셀 데이터로 변환 (400x400)
const canvas = document.createElement('canvas');
canvas.width = resolution;
canvas.height = resolution;
ctx.drawImage(img, 0, 0, resolution, resolution);
const imageData = ctx.getImageData(0, 0, resolution, resolution);

// 2. Marching Squares 알고리즘으로 윤곽선 추출
const contours = marchingSquares(binaryGrid);

// 3. 윤곽선을 THREE.Shape로 변환
contours.forEach(contour => {
  const shape = new THREE.Shape();
  shape.moveTo(contour[0].x, contour[0].y);
  for (let i = 1; i < contour.length; i++) {
    shape.lineTo(contour[i].x, contour[i].y);
  }
  shape.closePath();
  shapes.push(shape);
});

// 4. ExtrudeGeometry로 3D 변환
const extrudeSettings = {
  depth: config.qrThickness,
  bevelEnabled: false,
  curveSegments: 12,
};
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
```

**이미지 3D 변환 흐름**:
```
1. PNG/JPG 이미지 로드
   ↓
2. Canvas에 그려서 픽셀 데이터 추출 (400x400)
   ↓
3. 흑백 이진화 (threshold: 128)
   ↓
4. Marching Squares 알고리즘으로 윤곽선 추출
   - 각 픽셀의 4개 코너를 체크
   - 16가지 케이스에 따라 선분 생성
   - 연결된 선분을 윤곽선(contour)으로 그룹화
   ↓
5. 윤곽선을 THREE.Shape로 변환
   - moveTo() + lineTo()로 2D 경로 생성
   ↓
6. ExtrudeGeometry로 돌출 (2D → 3D)
   - depth: QR 두께와 동일
   - curveSegments: 12 (곡선 부드럽게)
   ↓
7. 여러 Shape를 mergeGeometries로 병합
```

**문제점**:
- Marching Squares로 생성된 윤곽선이 매우 세밀함 (400x400 해상도)
- `ExtrudeGeometry`가 각 윤곽선마다 수천 개의 정점 생성
- 여러 Shape를 병합할 때 중복 정점 발생

### Three.js mergeVertices 시도 (실패)

#### 시도 1: tolerance 0.0001mm
```typescript
const cleaned = mergeVertices(geometry, 0.0001);
```
**결과**: 거의 병합 안됨 (422개만 제거)

#### 시도 2: tolerance 0.01mm
```typescript
const cleaned = mergeVertices(geometry, 0.01);
```
**결과**: 일부 병합되지만 **메시가 깨짐** (UV 좌표, Normal 방향 무시하고 병합)

#### 왜 실패했나?
- Three.js `mergeVertices`는 **위치만 비교**해서 병합
- **Normal 방향이 다른 정점**도 병합 → Shading 깨짐
- **UV seam**도 무시하고 병합 → 텍스처 왜곡
- 블렌더의 "Merge by Distance"는 Normal/UV를 고려하여 안전하게 병합

### 현재 해결 방법 (블렌더 경유)

#### 워크플로우
1. **웹에서 OBJ Export**
   ```
   Home.tsx → OBJ Export 버튼 클릭
   → 3d_qr_export.obj + 3d_qr_export.mtl 다운로드
   ```

2. **블렌더에서 처리**
   ```
   1. File → Import → Wavefront (.obj)
   2. Edit Mode (Tab)
   3. Select All (A)
   4. Mesh → Clean Up → Merge by Distance
      - Distance: 0.0001
   5. File → Export → Wavefront (.obj)
      - Include: Selection Only
      - Export Materials: Yes
   ```

3. **뱀부랩에서 슬라이싱**
   - 수정된 OBJ 파일 import
   - 비매니폴드 오류 없이 정상 슬라이싱

#### 왜 블렌더를 경유해야 하나?
- 블렌더의 "Merge by Distance"는 **스마트하게 병합**:
  - Normal 방향 고려 (면의 방향 유지)
  - UV seam 보존 (텍스처 유지)
  - 메시 토폴로지 유지 (모양 안 깨짐)
- Three.js보다 훨씬 안전하고 정확함

### 향후 개선 방안

#### 옵션 1: 블렌더 Python 스크립트 자동화 (권장)
```python
# blender_cleanup.py
import bpy
import sys

# OBJ 파일 경로를 인자로 받음
obj_path = sys.argv[-1]

# Import OBJ
bpy.ops.import_scene.obj(filepath=obj_path)

# Select all
bpy.ops.object.select_all(action='SELECT')

# Edit mode
bpy.ops.object.mode_set(mode='EDIT')

# Merge by distance
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.0001)

# Export
bpy.ops.object.mode_set(mode='OBJECT')
output_path = obj_path.replace('.obj', '_cleaned.obj')
bpy.ops.export_scene.obj(filepath=output_path)
```

**사용법**:
```bash
blender --background --python blender_cleanup.py -- 3d_qr_export.obj
```

**장점**:
- 사용자가 블렌더를 수동으로 열 필요 없음
- 버튼 클릭 한 번으로 자동 처리 가능

**단점**:
- 블렌더 설치 필요
- 서버 배포 시 사용 불가 (로컬만 가능)

#### 옵션 2: QR 생성 방식 근본 변경 (복잡함)
- ExtrudeGeometry 사용: 2D Shape → 3D
- CSG 라이브러리 사용: Boolean 연산으로 박스 병합
- 하지만 **개발 시간이 많이 걸림**

#### 옵션 3: 서버 사이드 메시 처리
- Node.js에서 three.js 사용하여 서버에서 정점 병합
- 또는 C++ 라이브러리 (Open3D, CGAL) 사용
- **복잡하고 무거움**

#### 옵션 4: STL Export 추가 제공
- STL은 색상 정보 없지만 슬라이서가 더 관대함
- 단색 프린팅용 fallback

---

## 3. 이미지 3D 구현 방식 상세

### 전체 파이프라인

```
사용자 이미지 업로드 (PNG/JPG)
         ↓
[frontend/src/utils/imageUtils.ts]
         ↓
1. loadImage() - 이미지를 HTMLImageElement로 로드
         ↓
2. imageToPixelData() - Canvas API로 픽셀 데이터 추출
   - 400x400 해상도로 리샘플링
   - RGBA 픽셀 배열 생성
         ↓
3. pixelDataToBinary() - 흑백 이진화
   - 그레이스케일 변환: (R + G + B) / 3
   - Threshold: 128 (0~127: 검정, 128~255: 흰색)
         ↓
4. binaryToContours() - Marching Squares 알고리즘
   - 16가지 케이스 테이블로 윤곽선 추출
   - 연결된 선분을 contour로 그룹화
         ↓
5. contoursToShapes() - THREE.Shape 생성
   - moveTo() + lineTo()로 2D 경로
   - Even-Odd Fill Rule 적용
         ↓
[frontend/src/components/QRPlateInstance.tsx]
         ↓
6. ExtrudeGeometry() - 2D → 3D 돌출
   - depth: config.qrThickness (QR 두께와 동일)
   - curveSegments: 12
   - bevelEnabled: false
         ↓
7. mergeGeometries() - 여러 Shape 병합
         ↓
8. Scene에 Mesh로 렌더링
```

### 주요 알고리즘: Marching Squares

#### 원리
1. 2D 그리드를 순회하며 각 셀(2x2)의 4개 코너 체크
2. 각 코너가 검정(1) 또는 흰색(0)에 따라 16가지 케이스 분류
3. 케이스에 따라 선분 생성:
   ```
   케이스 0: 0000 → 선분 없음
   케이스 1: 0001 → 우하단 코너에 선분
   케이스 2: 0010 → 좌하단 코너에 선분
   ...
   케이스 15: 1111 → 선분 없음 (전부 채워짐)
   ```

4. 생성된 선분들을 연결하여 윤곽선 생성

#### 코드 위치
`frontend/src/utils/imageUtils.ts` (line 80-180)

```typescript
function marchingSquares(
  grid: number[][],
  width: number,
  height: number
): Point[][] {
  const contours: Point[][] = [];
  // 16가지 케이스 테이블
  const caseTable = [
    [], // 0000
    [[3, 2]], // 0001
    [[1, 3]], // 0010
    [[1, 2]], // 0011
    // ... (총 16개)
  ];

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const cellIndex =
        (grid[y][x] ? 1 : 0) |
        (grid[y][x + 1] ? 2 : 0) |
        (grid[y + 1][x + 1] ? 4 : 0) |
        (grid[y + 1][x] ? 8 : 0);

      const edges = caseTable[cellIndex];
      // 선분 생성 및 연결
    }
  }

  return contours;
}
```

### 현재 문제점 및 개선 가능성

#### 1. 해상도 고정 (400x400)
**현재**:
```typescript
imageToContours(config.imageFile, 400) // 하드코딩
```

**개선안**:
- 이미지 크기에 따라 동적 조절
- 고해상도 옵션 제공 (800x800, 1024x1024)
- 하지만 정점 수 급증 → 성능 저하

#### 2. Threshold 고정 (128)
**현재**:
```typescript
const threshold = 128; // 고정
```

**개선안**:
- 사용자가 조절 가능한 슬라이더 추가
- 자동 Threshold 계산 (Otsu's method)
- 배경 제거 옵션

#### 3. curveSegments 고정 (12)
**현재**:
```typescript
curveSegments: 12, // 부드러운 곡선
```

**개선안**:
- 성능 vs 품질 옵션 제공
  - Low: 3 (각진 모양, 빠름)
  - Medium: 6
  - High: 12 (부드러움, 느림)

#### 4. 중복 정점 문제
**현재**: 블렌더 경유 필수

**개선안**:
- 서버 사이드 메시 최적화
- WebAssembly 기반 mesh simplification
- 하지만 복잡도 높음

#### 5. Fill Rule (Even-Odd vs Non-Zero)
**현재**:
```typescript
// Even-Odd Fill Rule 사용 (구멍 있는 Shape 지원)
```

**개선안**:
- 사용자가 선택 가능하도록
- Non-Zero Fill Rule 옵션 추가

### 성능 최적화 가능성

#### 1. Web Worker 사용
```typescript
// imageUtils.ts를 Web Worker로 실행
const worker = new Worker('/workers/imageProcessor.worker.js');
worker.postMessage({ imageFile, resolution: 400 });
worker.onmessage = (e) => {
  setImageContours(e.data.contours);
};
```

**장점**:
- UI 블로킹 없이 백그라운드 처리
- 대용량 이미지도 부드럽게

#### 2. 메모이제이션 강화
```typescript
// 같은 이미지는 캐시에서 재사용
const imageContoursCache = new Map<string, ImageContours>();
```

#### 3. Progressive Loading
- Low resolution (100x100) 먼저 로드 → 프리뷰
- High resolution (400x400) 백그라운드 로드 → 최종

---

## 요약

### 폰트 로딩 문제
- **임시 해결**: Ctrl+Shift+R + 프론트 재시작
- **근본 해결**: TTF → JSON 변환 (프로덕션 배포 시)

### 중복 정점 문제
- **현재 해결**: 블렌더 경유 (Merge by Distance 0.0001)
- **자동화 가능**: 블렌더 Python 스크립트
- **근본 원인**: QR/텍스트/이미지의 geometry 생성 방식

### 이미지 3D 구현
- **알고리즘**: Marching Squares (윤곽선 추출)
- **3D 변환**: ExtrudeGeometry (2D Shape → 3D)
- **개선 가능**: 해상도 조절, Threshold 조절, Web Worker 사용

---

**작성일**: 2025-01-25
**마지막 업데이트**: 2025-01-25
