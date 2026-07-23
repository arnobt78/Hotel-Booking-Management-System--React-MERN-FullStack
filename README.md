# Hotel Booking Management System — React, Express.js Full-Stack MERN Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-black)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)](https://stripe.com/)
[![launch with diploi badge](https://diploi.com/launch.svg)](https://diploi.com/launch/arnobt78/Hotel-Booking-Management-System--React-MERN-FullStack)

A production-style **hotel booking platform** for learning full-stack TypeScript: guests search and book with **Stripe**, owners manage hotels with **Cloudinary** images, and everyone can explore a **Business Insights** dashboard. Built as a **MERN** monorepo (MongoDB · Express · React · Node) with a Vite SPA frontend.

- **Frontend (live):** [https://hotel-mern-booking.vercel.app/](https://hotel-mern-booking.vercel.app/)
- **Backend (live):** [https://hotel-booking-backend.arnobmahmud.com](https://hotel-booking-backend.arnobmahmud.com)
- **Security:** please report vulnerabilities privately — see [SECURITY.md](./SECURITY.md)

![Screenshot 2025-09-04 at 12 02 23](https://github.com/user-attachments/assets/7b87581f-8a1a-4de4-99c3-ba5fab14f20d)
![Screenshot 2025-09-04 at 12 03 00](https://github.com/user-attachments/assets/76e284bb-4324-4798-8e87-0079aab65a57)
![Screenshot 2025-09-04 at 12 03 48](https://github.com/user-attachments/assets/c35d0786-f80d-493e-815c-7a594253183c)
![Screenshot 2025-09-04 at 12 04 14](https://github.com/user-attachments/assets/d02e0687-8bd6-4924-8b07-9311c0308e11)
![Screenshot 2025-09-04 at 12 04 37](https://github.com/user-attachments/assets/2adc94fe-7bd8-4622-9d7e-2342ef5a7bd5)
![Screenshot 2025-09-04 at 12 05 31](https://github.com/user-attachments/assets/34fd12ca-9c3e-4242-960d-dfdfe5447299)
![Screenshot 2025-09-04 at 12 05 59](https://github.com/user-attachments/assets/ff330293-fe8e-487f-a73a-1a1c4ade0fc1)
![Screenshot 2025-09-04 at 12 06 36](https://github.com/user-attachments/assets/7b8c1b80-e395-4d46-b9f7-2b93211612eb)
![Screenshot 2025-09-04 at 12 07 06](https://github.com/user-attachments/assets/1b15e2b6-5ad0-42a7-b121-c54d9ddf623a)
![Screenshot 2025-09-04 at 12 07 24](https://github.com/user-attachments/assets/09e10d64-9c1d-4f0f-a167-a92d18caa85e)
![Screenshot 2025-09-04 at 12 07 44](https://github.com/user-attachments/assets/9cb2e884-759e-4545-a963-11df51aa9785)
![Screenshot 2025-09-04 at 12 08 32](https://github.com/user-attachments/assets/e89dd5df-c14f-4304-a012-9f3d35417182)
![Screenshot 2025-09-04 at 12 09 52](https://github.com/user-attachments/assets/a4729503-28f4-489e-bc8f-d5a3e3bea93a)
![Screenshot 2025-09-04 at 12 10 04](https://github.com/user-attachments/assets/68552511-83ac-42fa-8f54-99c926e3015d)
![Screenshot 2025-09-04 at 12 10 20](https://github.com/user-attachments/assets/a5d236d7-3a07-493d-b966-afdafa83b383)
![Screenshot 2025-09-04 at 12 10 33](https://github.com/user-attachments/assets/539c4d39-ca89-4383-9abd-1fa3dc184e50)

## Table of contents

- [What you will learn](#what-you-will-learn)
- [Features](#features)
- [Tech stack & keywords](#tech-stack--keywords)
- [Architecture overview](#architecture-overview)
- [Monorepo structure](#monorepo-structure)
- [Prerequisites](#prerequisites)
- [Environment variables (.env)](#environment-variables-env)
- [How to run locally](#how-to-run-locally)
- [Frontend walkthrough](#frontend-walkthrough)
- [Backend walkthrough](#backend-walkthrough)
- [API reference](#api-reference)
- [Authentication flow](#authentication-flow)
- [Booking & Stripe flow](#booking--stripe-flow)
- [Components & reuse guide](#components--reuse-guide)
- [Shared types](#shared-types)
- [Testing (Playwright)](#testing-playwright)
- [Deployment](#-deployment)
- [Learning path (suggested)](#learning-path-suggested)
- [Troubleshooting](#troubleshooting)
- [Related docs](#related-docs)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [License](#license)
- [Happy Coding!](#happy-coding-)

---

## What you will learn

This repository is designed as a **teaching project**. By reading and running it you practice:

| Topic                                     | Where it shows up                          |
| ----------------------------------------- | ------------------------------------------ |
| REST API design with Express + TypeScript | `hotel-booking-backend/src/routes/`        |
| JWT auth + optional Google OAuth          | `routes/auth.ts`, `middleware/auth.ts`     |
| Mongoose schemas & relations              | `models/`                                  |
| React SPA routing & layouts               | `App.tsx`, `layouts/`                      |
| Global state with Context + React Query   | `contexts/`, `api-client.ts`               |
| File uploads → Cloudinary                 | `routes/my-hotels.ts`                      |
| Card payments with Stripe PaymentIntents  | booking routes + `BookingForm`             |
| Tailwind + shadcn/ui-style primitives     | `components/ui/`                           |
| Monorepo shared contracts                 | `shared/types.ts`                          |
| Docker / Coolify + Vercel deploy          | backend Dockerfile, frontend `vercel.json` |

---

## Features

### For guests (travelers)

- Browse featured hotels on the home page
- Search by destination, dates, guests, price, stars, types, facilities
- Open hotel detail pages with images and amenities
- Register / sign in (email+password or Google)
- Book rooms with Stripe card payment (GBP)
- View **My Bookings**

### For hotel owners

- Add / edit hotels (multipart form, up to 6 images)
- List **My Hotels** and inspect booking logs per property
- Track revenue-related totals stored on hotel/user documents

### For learners / operators

- Interactive **Swagger** API docs (`/api-docs`)
- **API status** health UI (`/api-status`)
- **Business Insights** dashboard (`/business-insights`) with Recharts
- Rate limiting, Helmet, compression, Morgan logging on the API

> **Note:** `Review` and `Analytics` Mongoose models exist for future work; live insights currently aggregate from `Hotel`, `User`, and `Booking`.

---

## Tech stack & keywords

### Stack (MERN + friends)

| Layer         | Technology                                         | Role (beginner view)                        |
| ------------- | -------------------------------------------------- | ------------------------------------------- |
| Database      | **MongoDB** + **Mongoose**                         | Stores users, hotels, bookings as documents |
| API           | **Node.js** + **Express**                          | HTTP server; routes = endpoints             |
| UI            | **React 18** + **Vite**                            | SPA — fast HMR in development               |
| Language      | **TypeScript**                                     | Types catch bugs before runtime             |
| Styling       | **Tailwind CSS** + **Radix / shadcn-style UI**     | Utility CSS + accessible primitives         |
| Data fetching | **React Query (v3)** + **Axios**                   | Cache server data; attach JWT               |
| Auth          | **JWT** + **bcryptjs** + optional **Google OAuth** | Stateless login; hashed passwords           |
| Payments      | **Stripe**                                         | PaymentIntents; confirm then create booking |
| Media         | **Cloudinary** + **multer**                        | Image CDN after upload                      |
| Charts        | **Recharts**                                       | Business insights graphs                    |
| E2E           | **Playwright**                                     | Browser tests in `e2e-tests/`               |

### Keyword cheat-sheet

- **JWT (JSON Web Token):** signed string proving “this user is logged in.” Frontend stores it in `localStorage.session_id` and sends `Authorization: Bearer …`.
- **CORS:** browser rule; API must allow your frontend origin (`FRONTEND_URL`, Vercel, etc.).
- **PaymentIntent:** Stripe object that represents a payment attempt; booking is created only if status is `succeeded`.
- **React Query key:** string/array identity for a cached request (e.g. `validateToken`). Invalidate after login/logout.
- **SPA rewrite:** host (Vercel) serves `index.html` for all routes so `/search` works on refresh.

---

## Architecture overview

```text
Browser (React SPA :5174)
        │  HTTPS JSON + JWT Bearer
        ▼
Express API (:5001)
        ├── MongoDB Atlas
        ├── Stripe
        ├── Cloudinary
        └── Google OAuth (optional)
```

**Typical request path**

1. React page calls a function in `api-client.ts`
2. Axios (`lib/api-client.ts`) adds the Bearer token
3. Express route (+ optional `verifyToken`) runs
4. Mongoose reads/writes MongoDB
5. JSON returns → React Query caches / invalidates

Deeper A–Z notes: [`docs/PROJECT_WALKTHROUGH.md`](./docs/PROJECT_WALKTHROUGH.md)

---

## Monorepo structure

```text
hotel-booking-1/   (or your clone folder)
├── hotel-booking-backend/     # Express API
│   ├── src/
│   │   ├── index.ts           # boot, middleware, mounts
│   │   ├── middleware/auth.ts # JWT verify
│   │   ├── models/            # User, Hotel, Booking, Review*, Analytics*
│   │   ├── routes/            # REST handlers
│   │   └── swagger.ts
│   ├── Dockerfile
│   ├── .env.example
│   └── .env.local.example
├── hotel-booking-frontend/    # Vite React SPA
│   ├── src/
│   │   ├── main.tsx           # providers
│   │   ├── App.tsx            # routes
│   │   ├── api-client.ts      # named API helpers
│   │   ├── lib/api-client.ts  # Axios + base URL
│   │   ├── contexts/          # App + Search
│   │   ├── pages/             # screens
│   │   ├── components/        # UI building blocks
│   │   ├── forms/             # booking + hotel forms
│   │   └── layouts/
│   ├── vercel.json
│   └── .env.local.example
├── shared/types.ts            # shared TypeScript contracts
├── e2e-tests/                 # Playwright
├── data/                      # fixtures (test users/hotel)
├── docs/                      # guides + walkthrough
├── SECURITY.md                # private vulnerability reports
└── README.md                  # this file
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** — local or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- (Recommended) **Stripe** test keys, **Cloudinary** free account
- (Optional) **Google Cloud** OAuth client for “Continue with Google”

---

## Environment variables (.env)

### Do you need a `.env`?

| Package      | Required to start?  | Notes                                                                                            |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------ |
| **Backend**  | **Yes**             | App **exits** if required vars are missing (`index.ts` fail-fast). Copy `.env.example` → `.env`. |
| **Frontend** | **Mostly optional** | SPA boots without a file, but set `.env.local` so API + Stripe point to the right places.        |

Never commit real `.env` / `.env.local` files (they are gitignored). Examples are safe templates.

---

### Backend — `hotel-booking-backend/.env`

Copy:

```bash
cd hotel-booking-backend
cp .env.example .env
# optional local overrides:
cp .env.local.example .env.local
```

#### Required (server will not start without these)

| Variable                    | What it is            | How to get it                                                                      |
| --------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `MONGODB_CONNECTION_STRING` | Mongo connection URI  | Atlas → Connect → Drivers → copy URI; replace password                             |
| `JWT_SECRET_KEY`            | Secret to sign JWTs   | `openssl rand -base64 64` (long random string)                                     |
| `CLOUDINARY_CLOUD_NAME`     | Cloudinary cloud name | [cloudinary.com](https://cloudinary.com) dashboard                                 |
| `CLOUDINARY_API_KEY`        | Cloudinary API key    | same dashboard                                                                     |
| `CLOUDINARY_API_SECRET`     | Cloudinary API secret | same dashboard                                                                     |
| `STRIPE_API_KEY`            | Stripe **secret** key | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) → `sk_test_…` |

#### Strongly recommended / optional

| Variable        | Purpose                                     | Local example                                     |
| --------------- | ------------------------------------------- | ------------------------------------------------- |
| `PORT`          | API port                                    | `5001` (macOS often blocks `5000` via AirPlay)    |
| `NODE_ENV`      | `development` / `production`                | `development`                                     |
| `FRONTEND_URL`  | CORS + OAuth redirects                      | `http://localhost:5174`                           |
| `BACKEND_URL`   | Public API origin for Google `redirect_uri` | local: omit (defaults to `http://localhost:PORT`) |
| `GOOGLE_ID`     | Google OAuth client id                      | Google Cloud Console → Credentials                |
| `GOOGLE_SECRET` | Google OAuth client secret                  | same                                              |

**Google redirect URI to register** (when using Google sign-in locally):

```text
http://localhost:5001/api/auth/callback/google
```

Production example: `{BACKEND_URL}/api/auth/callback/google`

---

### Frontend — `hotel-booking-frontend/.env.local`

Copy:

```bash
cd hotel-booking-frontend
cp .env.local.example .env.local
```

| Variable              | Required?           | Purpose                                                       |
| --------------------- | ------------------- | ------------------------------------------------------------- |
| `VITE_API_BASE_URL`   | Recommended locally | Backend origin, e.g. `http://localhost:5001`                  |
| `VITE_STRIPE_PUB_KEY` | For payments        | Stripe **publishable** key `pk_test_…` (used in `AppContext`) |

> Vite only exposes variables prefixed with `VITE_` to the browser. Never put secret keys (`sk_…`, Mongo URI, JWT secret) in frontend env.

If `VITE_API_BASE_URL` is unset, `getApiBaseUrl()` falls back by host (localhost → `:5001`, production defaults documented in walkthrough).

---

### Minimal “happy path” checklist

1. Atlas DB created → paste URI into backend `.env`
2. Generate `JWT_SECRET_KEY`
3. Create Cloudinary + Stripe test accounts → paste keys
4. Frontend: `VITE_API_BASE_URL=http://localhost:5001` and `VITE_STRIPE_PUB_KEY=pk_test_…`
5. Start backend, then frontend

You can explore UI/API docs without Google OAuth. You need Stripe keys for real booking payments.

---

## How to run locally

Use **two terminals**.

### 1) Backend

```bash
cd hotel-booking-backend
npm install
cp .env.example .env   # then edit values
npm run dev            # → http://localhost:5001
```

Smoke checks:

- Health: `http://localhost:5001/api/health`
- Swagger: `http://localhost:5001/api-docs`

### Demo data seed (Mongoose — wipes local DB)

```bash
cd hotel-booking-backend
npm run seed   # destroys User/Hotel/Booking/Review/Analytics then reseeds
```

Login after seed: `test@user.com` / `12345678` (**admin** — opens `/admin`). Also: `owner@hotel.com`, `guest@user.com` (same password). This stack uses **MongoDB + Mongoose**, not Prisma.

Optional AI assist (draft-and-approve only): set `AI_ASSIST_ENABLED=true` in backend `.env` (optional `OPENAI_API_KEY`; stub drafts when unset).

### 2) Frontend

```bash
cd hotel-booking-frontend
npm install
cp .env.local.example .env.local   # edit VITE_* as needed
npm run dev                        # → http://localhost:5174
```

### Build verification

```bash
cd hotel-booking-backend && npm run build
cd hotel-booking-frontend && npm run build && npm run lint
```

---

## Frontend walkthrough

### Bootstrap (`main.tsx`)

```text
QueryClientProvider
  └── AppContextProvider      (auth, Stripe, toasts, global loading)
        └── SearchContextProvider   (search criteria → sessionStorage)
              └── App (React Router)
```

**React Query** caches API responses. After login/logout the app invalidates the `validateToken` query so `isLoggedIn` updates.

### Routes (`App.tsx`)

| Path                                 | Page               | Notes                          |
| ------------------------------------ | ------------------ | ------------------------------ |
| `/`                                  | Home               | Featured hotels                |
| `/search`                            | Search             | Filters + pagination           |
| `/detail/:hotelId`                   | Detail             | Public                         |
| `/business-insights`                 | AnalyticsDashboard | Charts                         |
| `/api-docs`, `/api-status`           | Docs / health UI   | Public                         |
| `/register`, `/sign-in`              | Auth forms         | `AuthLayout`                   |
| `/auth/callback`                     | OAuth return       | Writes token to `localStorage` |
| `/my-bookings`, `/my-hotels`         | Lists              | API still needs JWT            |
| `/hotel/:hotelId/booking`            | Booking            | UI requires login              |
| `/add-hotel`, `/edit-hotel/:hotelId` | Owner forms        | UI requires login              |

Layouts: `Layout` (chrome) · `AuthLayout` (centered auth).

### API client layers

| File                | Job                                                               |
| ------------------- | ----------------------------------------------------------------- |
| `lib/api-client.ts` | Axios instance, base URL, Bearer interceptor, 401 cleanup         |
| `api-client.ts`     | Named helpers: `signIn`, `searchHotels`, `createPaymentIntent`, … |

Example pattern you can reuse in other projects:

```ts
// Conceptual — see real helpers in api-client.ts
export const fetchMyHotels = async () => {
  const response = await apiClient.get("/api/my-hotels");
  return response.data;
};
```

---

## Backend walkthrough

### Boot sequence (`src/index.ts`)

1. Load `dotenv`
2. **Fail fast** if required env vars missing
3. Configure Cloudinary
4. Connect MongoDB
5. Apply middleware (Helmet, rate limit, compression, Morgan, CORS, cookies, JSON)
6. Mount routes
7. Listen on `PORT` (default **5001**)

### Middleware highlights

- **`helmet`** — security headers
- **`express-rate-limit`** — general `/api/*` + stricter payment path
- **`cors`** — allows `FRONTEND_URL`, localhost Vite ports, `*.vercel.app`, `*.netlify.app`
- **`verifyToken`** — reads JWT from `Authorization: Bearer` or cookie `session_id`

### Data models

| Model              | File                | Idea                                        |
| ------------------ | ------------------- | ------------------------------------------- |
| User               | `models/user.ts`    | email, hashed password, profile, totals     |
| Hotel              | `models/hotel.ts`   | owner `userId`, pricing, images, policies   |
| Booking            | `models/booking.ts` | separate collection (not embedded in Hotel) |
| Review / Analytics | schemas only        | future REST                                 |

---

## API reference

Base URL local: `http://localhost:5001`

### Auth — `/api/auth`

| Method | Path               | Auth | Description                                |
| ------ | ------------------ | ---- | ------------------------------------------ |
| GET    | `/google`          | —    | Start Google OAuth                         |
| GET    | `/callback/google` | —    | OAuth callback → redirect frontend + token |
| POST   | `/login`           | —    | Email/password → JWT                       |
| GET    | `/validate-token`  | JWT  | `{ userId }`                               |
| POST   | `/logout`          | —    | Clear session cookie                       |

### Users — `/api/users`

| Method | Path        | Auth | Description     |
| ------ | ----------- | ---- | --------------- |
| POST   | `/register` | —    | Create user     |
| GET    | `/me`       | JWT  | Current profile |

### Hotels — `/api/hotels`

| Method | Path                                | Auth | Description                        |
| ------ | ----------------------------------- | ---- | ---------------------------------- |
| GET    | `/`                                 | —    | All hotels                         |
| GET    | `/search`                           | —    | Filters + pagination (page size 5) |
| GET    | `/:id`                              | —    | Hotel by id                        |
| POST   | `/:hotelId/bookings/payment-intent` | JWT  | Stripe PaymentIntent               |
| POST   | `/:hotelId/bookings`                | JWT  | Confirm booking after payment      |

**Search query params:** `destination`, `adultCount`, `childCount`, `facilities[]`, `types[]`, `stars[]`, `maxPrice`, `sortOption`, `page`

### My hotels — `/api/my-hotels`

| Method | Path        | Auth | Description                  |
| ------ | ----------- | ---- | ---------------------------- |
| POST   | `/`         | JWT  | Create + images (Cloudinary) |
| GET    | `/`         | JWT  | Owner list                   |
| GET    | `/:id`      | JWT  | One owned hotel              |
| PUT    | `/:hotelId` | JWT  | Update                       |

### My bookings — `/api/my-bookings`

| Method | Path | Auth | Description                      |
| ------ | ---- | ---- | -------------------------------- |
| GET    | `/`  | JWT  | Guest bookings (hotel populated) |

### Bookings management — `/api/bookings`

| Method | Path              | Auth | Description                      |
| ------ | ----------------- | ---- | -------------------------------- |
| GET    | `/`               | JWT  | List                             |
| GET    | `/hotel/:hotelId` | JWT  | By hotel                         |
| GET    | `/:id`            | JWT  | By id                            |
| PATCH  | `/:id/status`     | JWT  | Status                           |
| PATCH  | `/:id/payment`    | JWT  | Payment status                   |
| DELETE | `/:id`            | JWT  | Delete + adjust analytics fields |

### Health — `/api/health`

| Method | Path        | Description                                                      |
| ------ | ----------- | ---------------------------------------------------------------- |
| GET    | `/`         | Public liveness (`status`, `timestamp`, `database.status` only)  |
| GET    | `/detailed` | JWT — rounded memory MB + uptime (no host/PID/Node)              |

### Business insights — `/api/business-insights`

| Method | Path                                     | Auth    | Description  |
| ------ | ---------------------------------------- | ------- | ------------ |
| GET    | `/dashboard` · `/dashboard/public`       | JWT / — | Metrics      |
| GET    | `/forecast` · `/forecast/public`         | JWT / — | Forecast     |
| GET    | `/system-stats` · `/system-stats/public` | JWT / — | System stats |

Interactive docs: **`/api-docs`** (Swagger UI).

---

## Authentication flow

### Email / password

1. `POST /api/auth/login` with `{ email, password }`
2. Backend verifies with **bcrypt**, returns JWT
3. Frontend stores `localStorage.session_id` (+ user fields)
4. Axios sends Bearer token on later calls
5. `GET /api/auth/validate-token` drives `isLoggedIn`

### Google OAuth

1. Browser goes to `{API}/api/auth/google`
2. Google → `{BACKEND}/api/auth/callback/google`
3. Backend creates/finds user, redirects to `{FRONTEND}/auth/callback?token=…`
4. `AuthCallback` saves token and invalidates React Query

### Logout

`POST /api/auth/logout` + clear `localStorage` + invalidate `validateToken`.

---

## Booking & Stripe flow

```text
Detail → /hotel/:id/booking
   → POST .../payment-intent  (server creates PaymentIntent, GBP)
   → BookingForm: stripe.confirmCardPayment(clientSecret)
   → POST .../bookings        (only if PaymentIntent succeeded)
   → /my-bookings
```

Amount ≈ `pricePerNight × nights × 100` (pence). Use Stripe **test cards** in development.

---

## Components & reuse guide

### High-value UI pieces

| Component                                      | Path                     | Reuse idea                                              |
| ---------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| `SearchBar` / `AdvancedSearch`                 | `components/`            | Copy pattern: form → context → navigate with query      |
| Filters (`PriceFilter`, `StarRatingFilter`, …) | `components/`            | Controlled checkboxes/sliders → parent search params    |
| `SearchResultsCard`                            | `components/`            | Presentational card: props in, Link out                 |
| `Pagination`                                   | `components/`            | Page number UI for any list API                         |
| `MainNav` / `MobileNav`                        | `components/`            | Auth-aware nav; swap brand links                        |
| `ManageHotelForm` sections                     | `forms/ManageHotelForm/` | Multi-section RHF form + file input                     |
| `BookingForm`                                  | `forms/BookingForm/`     | Stripe Elements wrapper pattern                         |
| `ui/*` (Button, Dialog, …)                     | `components/ui/`         | shadcn-style primitives — drop into other Tailwind apps |

### Contexts you can port

**AppContext** — “am I logged in?”, toasts, Stripe promise, global loading spinner.  
**SearchContext** — persist search criteria in `sessionStorage` so detail/booking keep dates/guests.

### Example: attaching JWT (portable)

```ts
// lib/api-client.ts (simplified idea)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("session_id");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Use the same pattern in any Axios/React project.

### Example: invalidate after auth

```ts
queryClient.invalidateQueries("validateToken");
queryClient.refetchQueries("validateToken");
```

---

## Shared types

`shared/types.ts` exports `UserType`, `HotelType`, `BookingType`, search/payment response shapes.

**Why it matters:** frontend and backend stay aligned. Docker backend build copies `shared/` into the image.

```ts
import { HotelType } from "../../shared/types";
```

---

## Testing (Playwright)

```bash
# Terminals: backend + frontend already running
cd e2e-tests
npm install
npx playwright test
```

| Spec                          | Covers             |
| ----------------------------- | ------------------ |
| `tests/auth.spec.ts`          | Sign-in / register |
| `tests/search-hotels.spec.ts` | Search             |
| `tests/manage-hotels.spec.ts` | Add hotel          |

Fixtures: `data/test-users.json`, `data/test-hotel.json`. Target UI: `http://localhost:5174`.

---

## 🚀 Deployment

### Optional: Launch with Diploi

Spin up a cloud environment from this public repo with no local install:

[![launch with diploi button](https://diploi.com/launch-big.svg)](https://diploi.com/launch/arnobt78/Hotel-Booking-Management-System--React-MERN-FullStack)

1. Click the button to create a Diploi deployment.
2. When it finishes, open the preview URL from the Diploi dashboard.

More info: [https://diploi.com/](https://diploi.com/)

> Diploi is optional for trying the project. Production demos for this repo use Coolify + Vercel below.

---

### Backend Deployment (Coolify on VPS)

1. Build from **repo root** context so `shared/` is included (see `hotel-booking-backend/Dockerfile`).
2. Set **all required** backend env vars in Coolify (same names as `.env.example`).
3. Set `FRONTEND_URL` to your Vercel URL; set `BACKEND_URL` to the public API origin.
4. Expose `PORT` as configured in Coolify; health check: `GET /api/health`.
5. Redeploy when `main` changes.

```bash
cd hotel-booking-backend
npm run build
```

---

### Frontend Deployment (Netlify/Vercel)

- Config: `hotel-booking-frontend/vercel.json` (SPA rewrite → `index.html`)
- Build: `npm run build` → `dist/`
- Env in host dashboard:
  - `VITE_API_BASE_URL` = production API origin
  - `VITE_STRIPE_PUB_KEY` = live or test publishable key

```bash
cd hotel-booking-frontend
npm run build
```

### Production checklist

- [ ] Secrets only in host dashboards (never in git)
- [ ] CORS / `FRONTEND_URL` match the live SPA
- [ ] Google OAuth redirect URIs match production `BACKEND_URL`
- [ ] Stripe keys match mode (test vs live)
- [ ] SSL + health endpoint OK

---

## Learning path (suggested)

1. Run backend health + open Swagger
2. Register a user, call `/api/users/me` with Bearer token
3. Trace `Search` page → `GET /api/hotels/search`
4. Add a hotel (watch Cloudinary URLs appear)
5. Complete one Stripe **test** booking
6. Read React Query invalidation on login/logout
7. Skim `docs/PROJECT_WALKTHROUGH.md` for A–Z

---

## Troubleshooting

| Symptom                         | Likely fix                                                               |
| ------------------------------- | ------------------------------------------------------------------------ |
| Backend exits immediately       | Missing required env var — check console list                            |
| Frontend calls wrong host       | Set `VITE_API_BASE_URL=http://localhost:5001`                            |
| CORS errors                     | Set backend `FRONTEND_URL=http://localhost:5174`                         |
| Port in use / weird 5000 issues | Use `PORT=5001`                                                          |
| Google OAuth fails              | Register exact callback URI; set `BACKEND_URL` / `FRONTEND_URL`          |
| Payments fail                   | Matching `sk_test` + `pk_test`; Booking page needs `VITE_STRIPE_PUB_KEY` |
| Images fail on create hotel     | Cloudinary trio in backend `.env`                                        |

---

## Related docs

| File                                                                                                   | Topic                                                 |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| [docs/PROJECT_WALKTHROUGH.md](./docs/PROJECT_WALKTHROUGH.md)                                           | Architecture A–Z                                      |
| [SECURITY.md](./SECURITY.md)                                                                           | Private vulnerability reporting                       |
| [docs/AUTH_UI_IMPLEMENTATION_GUIDE.md](./docs/AUTH_UI_IMPLEMENTATION_GUIDE.md)                         | Auth UI patterns                                      |
| [docs/DROPDOWN_TEST_CREDENTIALS_DOCS.md](./docs/DROPDOWN_TEST_CREDENTIALS_DOCS.md)                     | Test credential dropdown                              |
| [docs/CLERK_AUTH_COMPLETE_IMPLEMENTATION_GUIDE.md](./docs/CLERK_AUTH_COMPLETE_IMPLEMENTATION_GUIDE.md) | Clerk guide (portable; **not** this app’s live stack) |

---

## Keywords

`MERN` · `MongoDB` · `Express` · `React` · `Node.js` · `TypeScript` · `Vite` · `Tailwind CSS` · `React Query` · `Axios` · `JWT` · `OAuth` · `bcrypt` · `Stripe PaymentIntent` · `Cloudinary` · `multer` · `Mongoose` · `Swagger` · `Helmet` · `rate limiting` · `Recharts` · `Playwright` · `Vercel` · `Coolify` · `Docker` · `hotel booking` · `full-stack` · `open source`

---

## Conclusion

This project is a complete, production-flavored **hotel booking** codebase you can study end-to-end: typed API, JWT auth, media uploads, payments, analytics UI, and real deploy paths. Start with the env templates, run both apps locally, then follow one user journey (search → book) while reading the matching route and page files. Reuse the API-client, auth interceptor, form sections, and UI primitives in your own TypeScript React projects.

Questions or want to share what you built? Reach out via GitHub or [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

---

## Happy Coding! 🎉

This is an **open-source project** — feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).
