# Subscription Tracker & Renewal Dashboard

A responsive single-page web app for tracking recurring subscription costs, simulating monthly burn rates, and monitoring renewal dates.

Built with **Node.js + Express** backend (ES modules REST API on port 4000) and **React (Vite) + Tailwind CSS** frontend.

---

## 🏗️ Architecture Overview

- **Backend (`/server`)**: Port 4000 Express API. Houses **100% of business logic, calculations, date math, exchange rate conversions, and input validation**. Maintains an in-memory data store seeded with initial subscriptions.
- **Frontend (`/src`)**: Presentational-only React components (Vite dev server on port 5173). Fetches pre-computed subscriptions and dashboard metrics from the Express API.

---

## 🚀 Two-Terminal Run Instructions

### 1. Terminal 1: Run Express Backend Server (Port 4000)
```bash
cd server
npm install
npm start
```
*Output: `🚀 Express backend server listening on http://127.0.0.1:4000`*

### 2. Terminal 2: Run React Frontend (Port 5173)
```bash
# From project root directory
npm install
npm run dev
```
*Access in browser: `http://localhost:5173/` or `http://127.0.0.1:5173/`*

---

## 📡 Express API Endpoints

- `GET /api/subscriptions?currency=USD` — Returns list of pre-calculated subscriptions (with `displayCost`, `daysRemaining`, `isRenewingSoon`, `isOverdue`) and recomputed dashboard metrics.
- `POST /api/subscriptions` — Server-side validation (name required, cost > 0, valid date) & creates subscription.
- `PUT /api/subscriptions/:id` — Server-side validation & in-place update.
- `PATCH /api/subscriptions/:id/toggle` — Flips active/paused status and recomputes burn rate.
- `DELETE /api/subscriptions/:id` — Removes from in-memory array and returns deleted object (supports client Undo).
- `POST /api/subscriptions/reset` — Resets backend in-memory store to seed data.
- `GET /api/exchange-rates` — Returns real-time exchange rates map.

---

## ⚠️ Known Limitations
- The backend data store is kept in-memory; restarting the Express server resets subscription data to initial seed items.
