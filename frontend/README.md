# Buildfast frontend

React 18, Vite, Tailwind CSS 4, React Router, and Sandpack. See the [root README](../README.md) for setup, Docker, integration configuration, and verification commands.

`npm run dev` starts Vite with hot reload. `/api` is proxied to the API during development. `npm run build` produces static files in `dist`. `npm run lint` checks the source.

UI routes: `/`, `/features`, `/contact`, `/login`, `/register`; authenticated routes: `/ai`, `/builder`, `/deploy` (source export).
