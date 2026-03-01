# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (also runs Sentry source map upload)
npm run lint     # ESLint
```

No test suite is configured yet.

## Architecture

**Ando** is an AI-powered travel itinerary app. Next.js 16 App Router, Supabase (auth + Postgres), OpenAI GPT-4o, Sentry, deployed on Vercel.

### Route groups

| Group    | Path                                    | Purpose                                                                    |
| -------- | --------------------------------------- | -------------------------------------------------------------------------- |
| Root     | `app/page.tsx`                          | Public landing page (always public, checks auth to conditionally show CTA) |
| `(app)`  | `/dashboard`, `/trips/*`, `/onboarding` | Authenticated app — layout adds Navbar                                     |
| `(auth)` | `/login`, `/callback`                   | Auth flow — layout adds Navbar                                             |
| `shared` | `/shared/[shareToken]`                  | Public read-only itinerary view                                            |

### Server vs client pattern

Server components query Supabase **directly** (no HTTP round-trip). Client components call API routes for mutations and React Query for client-side fetching.

- `lib/supabase/server.ts` — `createServerClient()` for Server Components, Route Handlers, Middleware
- `lib/supabase/client.ts` — `createClient()` for Client Components

### API routes

| Route                                   | Method    | Purpose                                                      |
| --------------------------------------- | --------- | ------------------------------------------------------------ |
| `app/api/trips/route.ts`                | GET, POST | List / create trips                                          |
| `app/api/itineraries/generate/route.ts` | POST      | Generate itinerary via GPT-4o (synchronous at current scale) |

Generation is triggered from `/trips/[id]`, not from the trip creation form. This keeps trip creation and itinerary generation decoupled.

### Key constraint: 14-day trip max

Enforced in both client and server (`app/api/trips/route.ts`). Reason: keeps GPT-4o prompt size manageable and avoids Vercel's 60s function timeout.

### AI generation flow

1. `POST /api/itineraries/generate` with `{ tripId }`
2. Fetches trip + user profile from Supabase
3. Builds prompt via `lib/openai/prompts.ts` (system + user prompt)
4. Calls GPT-4o with `response_format: json_object`
5. Deactivates old itinerary versions, inserts new one to `itineraries` table

### Data types

All shared TypeScript types live in `lib/types.ts`: `Profile`, `Trip`, `Itinerary`, `ItineraryDay`, `Activity`, etc. The `itineraries.days` column is JSONB storing `ItineraryDay[]`.

### Design system — "Dusk Slate"

CSS custom properties defined in `app/globals.css`. Use these variables, not raw Tailwind color classes:

```
--bg, --bg-subtle, --bg-card
--border, --border-hi
--text, --text-2, --text-3
--accent, --accent-h, --cta, --cta-h
--shadow-sm, --shadow-md, --shadow-lg
```

Fonts: `--font-display` (Playfair Display, headings), `--font-body` (DM Sans, body text).

Styles use **CSS Modules** (`.module.css`) for component-scoped styles. Page-level styles are colocated with the page (e.g. `login.module.css` in the login folder). Tailwind is used for utility classes inside JSX in app-level pages.

### Supabase tables

- `profiles` — extends auth.users; has `travel_style` (JSONB), `preferences` (JSONB), `onboarded` (bool)
- `trips` — user trips; `share_token` for public sharing
- `itineraries` — linked to trips; `is_active` flag for current version; `days` JSONB

### Required env vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL        # Used for share link construction
```

Sentry config is in `.env.sentry-build-plugin` (auto-created by Sentry setup).
