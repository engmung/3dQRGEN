# 3D QR Designer (3dQRGEN) 🖨️✨

> **Where Noise Becomes Form**  
> FDM 3D 프린팅에 최적화된 3D QR 코드를 웹에서 즉시 생성하고 STL/OBJ로 내보내는 오픈소스 도구입니다.

[![Live Demo](https://img.shields.io/badge/Live_Demo-3d--qrgen.vercel.app-blue?style=for-the-badge&logo=vercel)](https://3d-qrgen.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/engmung/3dQRGEN?style=for-the-badge)](https://github.com/engmung/3dQRGEN)

---

## 📢 서비스 도메인 이전 및 오픈소스 전환 안내

* 본 프로젝트는 더 많은 3D 프린팅 메이커 및 개발자 분들이 자유롭게 활용하고 기여할 수 있도록 **오픈소스(MIT License)**로 전면 전환되었습니다.
* 기존 도메인(`3dqr.design`)은 **2026년 10월까지 유지**되며, 이후에는 Vercel의 영구 무료 도메인인 **[https://3d-qrgen.vercel.app](https://3d-qrgen.vercel.app)**을 통해 지속적으로 운영됩니다.
* 누구나 소스 코드를 자유롭게 클론하거나 포크하여 나만의 3D QR 제너레이터를 만들 수 있습니다.

---

## ✨ 제작자 소개 & 새로운 프로젝트

안녕하세요! 미디어 아티스트 & 메이커 **이승훈 (Lee Seunghun)** 입니다.

* **GitHub**: [@engmung](https://github.com/engmung)
* **Portfolio**: [lshsprotfolio.netlify.app](https://lshsprotfolio.netlify.app/en/)
* 📧 **Contact**: lsh678902@gmail.com

### 🌟 New Project: [Patternflow (patternflow.work)](https://patternflow.work)
> **소리와 빛이 만나는 인터랙티브 LED 오디오비주얼 신디사이저**  
> 3D QR 코드 생성기 다음으로 개발 중인 하드웨어 & 인터랙티브 아트 메이커 프로젝트입니다. 피지컬 노브와 버튼으로 패턴과 빛을 연주하는 오픈소스 프로젝트 [Patternflow](https://patternflow.work)도 많은 관심 부탁드립니다!

---

## 🚀 주요 기능 (Features)

* **3D QR 코드 생성**: URL, 일반 텍스트, Wi-Fi 접속 정보, vCard(연락처) 등을 규격에 맞게 3D 모델로 변환
* **다양한 지오메트리 & 커스텀**:
  * 3D 텍스트 삽입 (Pretendard 폰트 기반)
  * 2D 이미지 3D 외곽선 변환 (Marching Squares 알고리즘)
  * 다양한 각도의 거치대 및 플레이트 베이스 결합
* **3D 프린터 친화적 Export**:
  * **OBJ Export**: Bambu Studio, PrusaSlicer 등 멀티 컬러(AMS/MMU) 슬라이서에서 각 파트 분리 인식
  * **STL Export**: 일반 단색 FDM 슬라이서 및 레이어 일시정지(Color change at layer height) 방식 지원
  * 완벽한 매니폴드(Manifold) 메쉬 보장
* **100% 클라이언트 사이드 실행**:
  * 입력된 Wi-Fi 비밀번호나 데이터가 외부 서버로 전송되지 않고 브라우저 내에서만 안전하게 처리됩니다.

---

## 🛠️ 기술 스택 (Tech Stack)

* **Framework**: React 19, TypeScript, Vite
* **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
* **State Management**: Zustand
* **Algorithms & Utils**: `marchingsquares`, `qrcode`, `react-colorful`
* **Hosting**: Vercel

---

## 💻 로컬 개발 환경 실행 (Getting Started)

Node.js 18 이상이 필요합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/engmung/3dQRGEN.git
cd 3dQRGEN/frontend

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## 📄 라이선스 (License)

이 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.
자유롭게 수정, 배포, 상업적 이용이 가능합니다.
