# 3D QR Designer

브라우저에서 3D 프린팅용 QR 코드를 만드는 프론트엔드 전용 앱. 백엔드 없음 (2025-11에 제거).
배포: Vercel (https://3d-qrgen.vercel.app), 레포는 MIT 오픈소스.

## 스택
React 19, TypeScript, Vite, Three.js, React Three Fiber, Zustand

## 구조
```
frontend/
  src/pages/        Landing(/), Home(/editor), HomeDebug(/debug)
  src/components/   QRPlateInstance(QR/텍스트/이미지), GLBBaseParts(거치대 GLB), panels/
  src/hooks/        useQRGeometry, useTextGeometry, useImageGeometry, useOBJExport
  src/utils/        imageUtils/(Marching Squares), obj/, objExporter, meshCollector, fontLoader
  public/models/    거치대 GLB 파츠
vercel.json         빌드/캐시/SPA rewrite 설정
```

## 기능
- QR 타입: url, wifi, email
- 베이스: stand(거치대), card(명함, 모서리 sharp/rounded/chamfered)
- 내보내기: OBJ만 (파트별 오브젝트 분리). STL 내보내기는 없음

## 환경 변수
- `VITE_DEV_MODE`: `true`면 /debug에서 OBJ Transform 패널 표시

## 명령
```bash
cd frontend
npm run dev
npm run build   # tsc -b && vite build
npm run lint
```

## 참고
- 폰트 로딩 실패 시 Ctrl+Shift+R (개발 환경)
