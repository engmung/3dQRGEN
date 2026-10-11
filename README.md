# 3D QR Designer

A web tool for making 3D-printable QR codes. Built with React and Three.js, and it runs entirely in the browser.

Live: [www.3dqrdesign.site](https://www.3dqrdesign.site)

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

Lee Seunghun ([GitHub](https://github.com/engmung), [portfolio](https://lshsprotfolio.netlify.app/en/)).

## License

Code is [MIT](./LICENSE). Bundled fonts (Pretendard, Roboto) are under the SIL Open Font License 1.1.
