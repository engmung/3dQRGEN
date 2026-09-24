# 3D QR 플랫폼 Frontend

React + Three.js 기반 3D QR 코드 생성 플랫폼의 프론트엔드입니다.  
**Live Demo:** [https://3d-qrgen.vercel.app](https://3d-qrgen.vercel.app)

* 제작자: [이승훈 (Lee Seunghun)](https://github.com/engmung)
* 신규 프로젝트: [Patternflow (patternflow.work)](https://patternflow.work) — 오픈소스 LED 오디오비주얼 신디사이저

## 기술 스택
- React 19 + TypeScript
- Three.js (R3F, Drei)
- Zustand (상태 관리)
- Vite (빌드 도구)

## 개발 환경 설정

### 1. 환경 변수 설정
`.env.local` 파일 생성:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_API_BASE_URL=http://localhost:8000
VITE_DEV_MODE=false
```

### 2. 의존성 설치 및 실행
```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 주요 기능
- 3D QR 코드 생성 (GLB 기반)
- 3D 텍스트 추가 (Pretendard 폰트)
- 3D 이미지 변환 (Marching Squares)
- STL 거치대 (5가지 각도)
- OBJ Export

## 프로젝트 구조
```
src/
├── components/     3D 컴포넌트 (QRPlate, Scene3D 등)
├── pages/          페이지 (Home, Admin, MyOrders)
├── utils/          유틸리티 (imageUtils, objExporter, api)
└── store/          Zustand 스토어
```

## 전체 프로젝트 정보
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - 전체 프로젝트 현황
- [KNOWN_ISSUES.md](../KNOWN_ISSUES.md) - 알려진 이슈
