# Frontend

The whole app lives here. See the [root README](../README.md) for an overview.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Optional `.env.local` (see `.env.example`):

```env
VITE_DEV_MODE=true   # opens the OBJ transform panel on /debug
```

## Layout

```
src/
├── pages/        Landing, Home (/editor), HomeDebug (/debug)
├── components/   Scene, panels, forms, QR/text/image plate rendering
├── hooks/        Geometry hooks for QR, text, and images
├── store/        Zustand stores
└── utils/        QR generation, image tracing, OBJ export, font loading
public/
├── models/       Stand parts (GLB) and the phone model used in the preview
└── fonts/        Fonts for 3D text
```

A Dockerfile and nginx config are included if you want to self-host instead of using Vercel.
