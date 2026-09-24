# 3D QR Designer

A web tool for making 3D-printable QR codes. Built with React and Three.js, and it runs entirely in the browser.

Live: [3d-qrgen.vercel.app](https://3d-qrgen.vercel.app)

## Domain change

The app has moved to [3d-qrgen.vercel.app](https://3d-qrgen.vercel.app). The old domain, 3dqrdesign.site, will stay up until October 2026.

## Features

- QR content: URL, Wi-Fi, email
- 3D text (Pretendard font)
- Image to 3D shape (marching squares)
- Stand or business card base (sharp, rounded, or chamfered corners)
- OBJ export with each part as a separate object, for multi-color printing (Bambu AMS, Prusa MMU, etc.)
- No backend: what you type, including Wi-Fi passwords, never leaves the browser

## Running locally

Requires Node.js 18+.

```bash
git clone https://github.com/engmung/3dQRGEN.git
cd 3dQRGEN/frontend
npm install
npm run dev
```

Use `npm run build` for a production build.

## Author

Lee Seunghun ([GitHub](https://github.com/engmung), [portfolio](https://lshsprotfolio.netlify.app/en/)). I'm also working on [Patternflow](https://patternflow.work), an open-source LED audiovisual synthesizer.

## License

[MIT](./LICENSE)
