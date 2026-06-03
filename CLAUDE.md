# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two-package monorepo with no root `package.json`. Run commands from inside either `client/` or `server/`.

- `client/` — Vite + React 19 + Tailwind v4 + shadcn/ui (style: `new-york`). Path alias `@` → `client/src`.
- `server/` — Express 5 + Sequelize 6 + MySQL2 + Socket.io. CommonJS.

Both deploy to Vercel (`client/vercel.json` SPA rewrite, `server/vercel.json` routes everything to `src/index.js`).

## Common commands

### Server (`cd server`)
- `npm run dev` — nodemon on `src/index.js`, listens on `PORT` env (default 3000).
- `npm start` — production start.
- `npm test` — Jest with coverage; runs only `tests/**/*.test.js` (`--detectOpenHandles --verbose`).
- Run a single test file: `npx jest tests/unit/controllers/auth.controller.test.js`
- Run a single test by name: `npx jest -t "login"`

### Client (`cd client`)
- `npm run dev` — Vite dev server (default port 5173).
- `npm run build` — Vite production build to `dist/`.
- `npm run lint` — ESLint over the project (flat config in `eslint.config.js`).
- `npm run preview` — Serve the built `dist/`.
- No client-side test runner is configured.

### Required environment variables
- Server: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, optional `SERVER_URL`, `ALLOWED_ORIGINS` (comma-separated, appended to defaults `localhost:5173`, `localhost:3000`, `tpf-sims.vercel.app`).
- Client: `VITE_API_URL` (defaults to `http://localhost:3000/api`). The Socket.io URL is derived by stripping `/api` from this value.

## Architecture

### Server: layered, role-gated, cookie-auth API

Bootstrapping happens entirely in [server/src/index.js](server/src/index.js): it loads `dotenv`, `require("./entities")` (which side-effect-defines all Sequelize associations), `initSocket(server)`, registers all `/api/*` routers, and mounts Swagger at `/api-docs`. The `app` and `server` are both exported for Vercel.

Layers (mirror each other one-to-one):
- `routes/*.routes.js` — Express routers; each route file mounts `verifyAccessToken` and usually a role guard, runs `validate(schema)` from Joi, then dispatches to the controller. Swagger JSDoc comments on routes are the API spec.
- `controller/*.controller.js` — Class-based controllers exporting an instance. Business logic lives here (no service layer).
- `entities/*.js` — Sequelize models. **All cross-model associations are declared in [server/src/entities/index.js](server/src/entities/index.js)**, not in individual model files. When adding a model, register it here and add its `hasMany`/`belongsTo`/`belongsToMany` so the relations exist at boot.
- `validations/*.validation.js` — Joi schemas paired with route files.
- `middlewares/auth.middleware.js` — `verifyAccessToken` reads the `accessToken` HTTP-only cookie, verifies with `JWT_ACCESS_SECRET`, attaches `req.user = { userId, email, roleCode }`. `verifyRole(["OWNER", ...])` checks `req.user.roleCode`.
- `sockets/socketManager.js` — singleton `io`. Maintains `userSockets` (userId → socket.id) populated when the client emits `register`. Exports `sendNotification({ userId, title, message, type, link, createBy })` which **persists to the `Notification` table AND emits `new_notification`**, and `forceLogout(userId)` which emits `force_logout` to that user's room.

Auth flow specifics:
- Login sets two cookies: `accessToken` (15m) and `refreshToken` (7d), httpOnly. In production, `secure: true` and `sameSite: "None"`; in dev, `sameSite: "Strict"`. The refresh token is also stored in the `RefreshToken` table.
- Token refresh is **cookie-driven**: clients call `POST /api/auth/refresh-token` with credentials and the cookies are rotated server-side.
- Roles in the system are `OWNER`, `ACCOUNTANT`, `SALES`, `WORKER` (codes on `UserRole.role_code`).

Database: Sequelize connects in [server/src/config/db.js](server/src/config/db.js) with TLS (`ssl.rejectUnauthorized: false`) and a 5-connection pool. There are no migrations — schemas live in the model files and are expected to match an externally-managed MySQL instance.

### Client: role-based SPA with cookie auth and SWR-style cache

[client/src/App.jsx](client/src/App.jsx) wraps everything in `AuthProvider` → `NotificationProvider` → `RouterProvider`.

Routing ([client/src/routes/index.jsx](client/src/routes/index.jsx)) groups feature areas under `ProtectedRoute` with `allowedRoles`:
- `/owner/*` → `["OWNER"]`
- `/accountant/*` → `["ACCOUNTANT", "OWNER"]`
- `/worker/*` → `["WORKER", "OWNER"]`
- `/sales/*` → `["SALES", "OWNER"]`
- `/auth/*` is public; `/403` and `/404` are catch-alls.

`ProtectedRoute` ([client/src/routes/ProtectedRoute.jsx](client/src/routes/ProtectedRoute.jsx)) waits on `AuthContext.loading`, redirects to `/auth/login` if unauthenticated, or `/403` if the role doesn't match.

`AuthContext` ([client/src/context/AuthContext.jsx](client/src/context/AuthContext.jsx)) keeps a `localStorage.user` "hint" so it only calls `GET /api/auth/profile` on reload when the user previously logged in. The hint stores only `{ name, role }`; the real session lives in HTTP-only cookies.

Axios ([client/src/lib/axios.js](client/src/lib/axios.js)) is the single HTTP client. It runs with `withCredentials: true` and has a **401 refresh interceptor with a request queue**: on 401 (excluding `/auth/refresh-token`, `/auth/profile`, `/auth/login`) it calls `POST /auth/refresh-token`, queues parallel requests, replays them on success, or hard-redirects to `/auth/login` on failure. Don't add a competing interceptor or duplicate the queue logic.

Real-time ([client/src/services/socket.service.jsx](client/src/services/socket.service.jsx) + `NotificationContext`): on login, the client opens a singleton `socket.io-client` connection, emits `register` with `user.user_account_id`, and listens for `new_notification` (renders a `react-hot-toast` and pushes into `NotificationContext`) and `force_logout` (calls `AuthContext.logout`). De-dup of toasts uses an in-memory `Set` of seen `pk_notification_id`s capped at 50.

Caching pattern — see [client/AI_Comand/REFACTORING_GUIDELINES.md](client/AI_Comand/REFACTORING_GUIDELINES.md). Data fetching uses [client/src/hooks/useCachedFetch.js](client/src/hooks/useCachedFetch.js), an SWR-style hook backed by `cacheService` (localStorage with TTL). When refactoring a list/table page:
- Wrap the fetcher in `useCallback` with all filter/page/search deps.
- Use a dynamic cache key like `` `prefix_${filter}_${page}` ``; default TTL 5 min.
- Show the global "purple bar" indicator (`fixed top-0 h-[2px] bg-indigo-500 z-[9999]`) when `isLoading || isRefreshing`.
- Remove legacy `useState` for data/loading/total and any manual `useEffect` fetcher — the hook handles race conditions.

Design system — [client/AI_Comand/DESIGN.md](client/AI_Comand/DESIGN.md) defines an Apple-inspired language (SF Pro typography, single Apple Blue `#0071e3` accent, alternating black / `#f5f5f7` sections, 980px-radius pill CTAs, soft `3px 5px 30px @ 0.22` card shadows). Reach for these tokens before introducing new ones. shadcn primitives live in `client/src/components/ui/` and use the `neutral` base color with CSS variables.

### Pages directory convention

`client/src/pages/` is split by role: `owner-page/`, `accountant-page/`, `sales-page/`, `worker-page/`, plus `auth-page/` and `common/`. Service modules in `client/src/services/` map one-to-one with backend resources (`order.service.js` → `/api/order`, etc.); add new endpoints there rather than calling axios from components.

## Testing approach

Server uses Jest + supertest. Tests are colocated under `server/tests/unit/controllers/`, one file per controller, and **mock Sequelize entities entirely** (see the `jest.mock("../../../src/entities", ...)` pattern in [auth.controller.test.js](server/tests/unit/controllers/auth.controller.test.js)) — they do not touch a real DB. When adding a controller, mirror this pattern: mock entities, `bcrypt`, `jwt`, `crypto`, `nodemailer`, and the system-log/email helpers.

## Windows / shell notes

The repo lives on Windows (`d:\TPF-SIMS`) but Claude Code runs through bash. Use forward slashes and Unix syntax (`/dev/null`, not `NUL`). Most tooling (Vite, Jest, nodemon) is cross-platform.

## API documentation

Once the server is running, full Swagger UI is at `http://localhost:3000/api-docs`. Route-level Swagger comments are the source of truth for request/response shapes — keep them updated when changing route signatures.
