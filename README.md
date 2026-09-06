# 🌾 FarmFlow

**The farmer-facing dashboard for FarmFlow** — a real-time greenhouse control panel built with Next.js 16 for greenhouse and high-value crop growers in Bangladesh. Live sensor telemetry, an AI crop advisor, and a moderated grower community, all in one authenticated app.

<p align="center">
  <a href="https://farmflow.sajibofficial.me"><img src="https://img.shields.io/badge/%F0%9F%9F%A2%20LIVE-farmflow.sajibofficial.me-16a34a?style=for-the-badge" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" />
</p>

<p align="center">
  <img src="https://i.ibb.co.com/LhhFxWFD/github-banner-hardware-farmflow.jpg" width="49%" alt="FarmFlow hardware" />
  <img src="https://arbora-bucket.s3.us-east-2.amazonaws.com/system+assets/IMAGE+2026-09-05+22%3A26%3A38.jpg" width="49%" alt="FarmFlow dashboard" />
</p>

---

## ✨ Features

**Advanced**
- 📡 **Live telemetry, zero polling** — an authenticated Socket.IO namespace pushes sensor readings straight into the charts as they land; actuator commands travel the same socket in reverse.
- 🤖 **Streaming AI advisor** — a conversation that reads the field's real sensor values and soil profile, streams its answer token-by-token, and escalates to a verified agronomist without losing the thread.
- 📸 **Field snapshots** — attach a point-in-time capture of a field (reading + soil + 3-day forecast) to a chat or a forum post; it renders everywhere as one card, frozen at the moment it was taken.
- 🗺️ **Map-driven field setup** — draw a field boundary on a Leaflet map and the backend resolves soil and weather data for that exact spot.
- 🛡️ **Tri-state moderation UI** — forum posts show *pending / published / rejected-with-reason* instead of a binary published flag, because "still reviewing" and "rejected" need different screens.
- 🔑 **One-click demo login** — recruiters and reviewers sign in as farmer, expert or admin with no password, no setup.

**Also included:** role-aware routing (farmer / expert / admin), expert & admin dashboards, public profiles with follow graph, password reset flow, responsive charts (Recharts), form validation (Zod + React Hook Form), toasts, dark-friendly UI (Radix + Tailwind v4).

---

## 🏗️ Architecture

```
ESP32 nodes ──MQTT──▶ FarmFlow API ──Socket.IO──▶  this client (Next.js, App Router)
(sensors +               (Express,                  SSR pages + live charts +
 actuators)              MongoDB time-series,        streaming advisor chat
                         AWS S3, OpenRouter LLM)
```

- Server-rendered on request for authenticated pages (session cookie read on the server), hydrated client components subscribe to the socket for anything that changes in real time.
- Talks to the [FarmFlow API](https://github.com/Hr-Sajib/FarmFlow-AppServer) over REST for CRUD and over Socket.IO for telemetry + advisory streaming.
- Sensor hardware is either a real ESP32 node (DHT11, BH1750, soil probes, servo + stepper + DC motor actuators) or the [ESP-Simulator](https://github.com/Hr-Sajib/ESP-Simulator-for-Farmflow) standing in for it — the client can't tell the difference; both speak the same MQTT payload.

---

## 🧰 Tech Stack

<p align="center">
<img src="https://img.shields.io/badge/-%20-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/-%20-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-161618?style=for-the-badge&logo=radixui&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
<img src="https://img.shields.io/badge/-%20-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
</p>

<p align="center"><sub>Next.js 16 · React 19 · TypeScript · Tailwind v4 · Radix UI · Framer Motion · Socket.IO client · Leaflet/React-Leaflet · Zod + React Hook Form · Recharts · Axios · Docker · GitHub Actions · Cloudflare</sub></p>

---

## 🔒 Security (deployment)

The client ships as a hardened container behind the same edge as the API — see the [API's security section](https://github.com/Hr-Sajib/FarmFlow-AppServer#-security-deployment) for the full infra story. What's specific to this app:

- ➤ Session lives in an **httpOnly cookie** issued by the API — never touches `localStorage`, never enters the JS bundle.
- ➤ Only `NEXT_PUBLIC_*` variables reach the client bundle; every secret stays server-side and out of the build.
- ➤ `next/image` remote hosts are an **explicit allowlist**, not a wildcard — narrowed further when uploads moved to direct S3 URLs.
- ➤ Ships as a **standalone Next.js build** in a distroless-style Alpine image, running as a non-root `nextjs` user with `cap_drop: ALL` and `no-new-privileges`.
- ➤ Sits behind Cloudflare (DNS/WAF/DDoS) → Caddy (TLS + routing) → container; the VPS itself is reachable only over Tailscale, and CI deploys through an authenticated tailnet — no exposed SSH.

---

## 🆕 Recent changes

- Switched all image URLs from an API proxy to **direct, public S3 URLs** — one less hop, one less thing for the API to serve.
- Matched the live hero chart to the **real two-second sensor cadence**.
- Upgraded to **Next.js 16.3.4** and tightened the image host allowlist.
- Shipped **profiles, forum moderation UI, field snapshots, and role-aware routing**.
- Containerized for subdomain deployment with a **push-to-deploy GitHub Actions workflow**.

---

## 🚀 Running it

```bash
npm install
npm run dev        # http://localhost:3002
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with fast refresh |
| `npm run build` | Production build |
| `npm run build:check` | Verify a build compiles without touching the dev server's `.next` output |
| `npm run lint` | ESLint |

> ⚠️ Use `build:check`, not `build`, while a dev server is running — `build` overwrites `.next` and the running dev server loses its stylesheet.
