# Streambert Web Build

This fork converts Streambert from an Electron desktop app to a web app deployable on Railway.

## What changed
- `<webview>` → `<iframe>` (Electron-only → standard HTML)
- `window.electron.*` → web shim that calls Express backend API
- AllManga episode resolution runs on the **server** (bypasses CORS/CloudFlare)
- Video proxy endpoint for direct mp4 streams with Referer requirements
- Express server serves the Vite build + API routes

## Railway deployment
1. Push to GitHub
2. New Railway project → "Deploy from GitHub repo"
3. Railway auto-detects `railway.json` and builds/deploys

## Environment variables
- `PORT` — auto-set by Railway (no action needed)
- `TMDB_API_KEY` — **optional**, for server-side TMDB if needed (app uses client-side key set by user)

## Local dev
```bash
npm install
npm run build   # build frontend
npm run serve   # start Express server
# open http://localhost:3000
```
