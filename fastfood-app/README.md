# FastFood POS — Frontend

React (Vite) + Tailwind CSS + React Router + Axios single-page app for the
FastFood order-management system.

## Setup

```bash
cd C:\xampp\htdocs\fastfood-app
npm install
npm run dev
```

Open http://127.0.0.1:5173

The Vite dev server proxies `/api` to `http://127.0.0.1:8000` (the Laravel API).
Start the API first (see `fastfood-api/README.md`).

## Default login

- Admin: `admin@fastfood.test` / `password`
- Staff: `staff@fastfood.test` / `password`

## Scripts

- `npm run dev` — development server
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview the production build
- `npm run lint` — oxlint

## Structure

```
src/
  api/            Axios service layer (one module per resource)
  components/     Reusable UI (Button, Input, Modal, Table, badges, states)
  context/        AuthContext (session + role)
  pages/          Login, Dashboard, QuickOrder, Orders, OrderDetail,
                  Kitchen, MenuManage, Sales, Users, Settings
  utils/          Formatting helpers
  App.jsx         Router with protected + role-aware routes
```