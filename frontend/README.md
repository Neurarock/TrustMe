# TrustMe — Money-Out Command Centre (Frontend)

A polished fintech operations cockpit for **TrustMe**: it receives money-out
requests, routes them to specialist ReAct agents, makes the agent reasoning
visible, and sends approved payments to **Ralio** for safe execution.

> TrustMe decides whether money should move. Ralio safely moves it.

## Stack

React + TypeScript · Vite · Tailwind CSS v4 · TanStack Query · React Router ·
Framer Motion · Zustand · Lucide icons · Vitest + Testing Library.

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # defaults to mock mode — safe for demos
npm run dev            # http://localhost:5173
```

## Mock vs live backend

The whole UI talks to a single typed API client (`src/api/types.ts`). Which
implementation is used is decided by `VITE_API_MODE`:

| `VITE_API_MODE` | Behaviour                                                        |
| --------------- | ---------------------------------------------------------------- |
| `mock` (default)| Runs entirely on in-memory seed data (`src/data/seed.ts`). Investigations, approvals and Ralio execution are simulated. No backend required. |
| `live`          | Talks to the REST API at `/api` (proxied to `VITE_API_TARGET`).  |

Because both clients implement the same `TrustMeApi` interface, no UI code
changes between modes — the demo stays safe even if the backend is down.

## Two experiences, one system

A mock login (`/login`) lets you enter as either role — no password.

| Role       | Theme              | Sees                                                           |
| ---------- | ------------------ | -------------------------------------------------------------- |
| **Client** | Light, Apple-clean | A shiny composer to submit requests + "My requests" with friendly acceptance status. |
| **Host**   | Crisp dark admin   | Dashboard, the incoming Money-Out Inbox, and the full agent investigation / Ralio controls. |

Switch roles anytime via the sign-out button in the header/sidebar.

## The demo flow

**As a client** (`/`)
1. The homepage is a **shiny input + upload box**. Type a request (or tap a
   preset) and hit send.
2. The **Orchestrator dispatch animation** plays: it classifies the request,
   routes it to the right specialist, and runs the Risk agent.
3. You land on a friendly **status page** — Submitted → Awaiting approval →
   Approved → **Paid 🎉** — with a plain-English explanation of what was checked.

**As a host** (`/host`)
1. **Dashboard** — metrics, recent activity, agent performance.
2. **Inbox** (`/host/inbox`) — every incoming request, filterable/searchable.
3. **Case detail** (`/host/inbox/:id`) — the hero admin screen:
   - **Investigate** → watch the ReAct timeline populate (thought → tool calls →
     observations → policy → risk → decision).
   - **Approve** then **Execute with Ralio** → status becomes _Paid_.
   - The duplicate case is **blocked before Ralio** — money never moves.

## Scripts

```bash
npm run dev        # dev server
npm run build      # typecheck + production build
npm run test       # run the Vitest suite
npm run typecheck  # tsc only
```

## Structure

```
src/
  api/        typed API clients (mock + http), TanStack Query hooks, ReAct engine
  components/ UI primitives + layout shells (ClientLayout light, HostLayout dark)
  data/       demo seed data (the four cases + agents)
  features/   auth (login + guards) · client (composer, status) · dashboard · inbox · detail
  lib/        formatting, labels, metrics, filters
  store/      Zustand stores (session/role, toasts)
  types/      shared domain types (single source of truth)
```

Theming is class-based: the host tree is wrapped in `.dark` and the shared
primitives carry `dark:` variants, so the same components render light for the
client and dark for the host.
