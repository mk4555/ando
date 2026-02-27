# CLAUDE.md — Ando MVP Build Plan

**Architect:** Claude (Sonnet 4.6)  
**Version:** 1.0  
**Date:** February 2026  
**Stage:** Friends & Founder — 5–20 users

---

## What We're Building

Ando is an AI travel planner. You describe a trip, it generates a personalized day-by-day itinerary. Users can view, lightly edit, and reference their plan during travel.

**This version is not trying to be the scaled product.** It is trying to answer one question:

> _Does an AI-generated itinerary make planning a real trip meaningfully better?_

Everything in this plan is chosen to answer that question as fast as possible.

---

## Current Status

> Last updated: February 2026  
> Update this section at the start of every new chat session.

**Build progress:**

- ✅ Step 1 — Project Foundation complete and committed
- ✅ Step 2 — Auth complete and committed (Google OAuth, middleware, session)
- ✅ Step 3 — Onboarding complete and committed (quiz, profile upsert, dashboard guard)
- 🔲 Step 4 — Trip Creation (next)
- 🔲 Step 5 — AI Generation
- 🔲 Step 6 — Polish, PWA & Invite Friends

**Edge case status:**

- ✅ Edge Case 001 — Profile row not created on login (fixed in Step 3)
- ✅ Edge Case 007 — Dashboard accessible mid-session with onboarded: false (fixed in Step 3)
- ⚠️ Edge Case 002 — OpenAI malformed JSON (fix in Step 5)
- ⚠️ Edge Case 003 — Regenerate button double-tap race condition (fix in Step 5)
- ⚠️ Edge Case 004 — Invalid trip dates (fix in Step 4)
- ⚠️ Edge Case 005 — Vercel 60s timeout on long trips (fix in Step 4 + 5)
- ⚠️ Edge Case 006 — Service role key bypasses RLS (audit in Step 5)

**Immediate next actions:**

1. Replace CLAUDE.md in project folder with latest version
2. Commit Step 3 completion to git
3. Start Step 4 — Trip Creation with date validation baked in from Edge Case 004

**Key decisions already made — do not revisit:**

- Web app (Next.js + Supabase) before React Native mobile app
- PWA for friends stage, no App Store yet
- Supabase client instead of GraphQL until mobile app is built
- Synchronous OpenAI calls, no job queue until >50 concurrent users
- Max trip duration 14 days (token limit + Vercel timeout protection)
- Profile row created at login via upsert, onboarding only updates

---

1. **No over-engineering.** If a feature isn't needed to answer the core question, cut it.
2. **Postgres schema is sacred.** Get the data model right. Everything else is throwaway.
3. **One codebase, one deployment.** No microservices, no queues, no separate services.
4. **Boring tech wins.** Next.js + Supabase + OpenAI. No exotic choices.
5. **You are the support team.** Onboard friends personally. Their confusion is product feedback.
6. **Maintain CLAUDE.md as a live document.** After each completed step: mark tasks complete with ✅, log any architectural decisions made with rationale, and update the last updated date. Never let it fall out of sync with the actual state of the project.

---

## Tech Stack

| Layer      | Choice                          | Why                                                                                     |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| Framework  | Next.js 14 (App Router)         | Full-stack in one repo. API routes + frontend. Vercel deploy in minutes.                |
| Database   | Supabase (PostgreSQL)           | Managed Postgres + auth + storage. Free tier covers this stage. Schema carries forward. |
| Auth       | Supabase Auth                   | Built-in. Social login (Google). No Auth0 cost at this scale.                           |
| AI         | OpenAI GPT-4o (direct API call) | No queue needed. `await openai.chat()` is fine for 20 users.                            |
| Styling    | Tailwind CSS                    | Fast, no design system overhead.                                                        |
| State      | React Query (TanStack)          | Server state caching. Same library used in full-stack version — no migration later.     |
| Deployment | Vercel                          | Zero-config. Automatic preview deployments per branch.                                  |
| Monitoring | Sentry (free tier)              | Catch errors before your friends tell you.                                              |

**Monthly cost estimate: $0–20**  
Vercel free tier handles this easily. Supabase free tier gives you 500MB DB + 50K auth users. OpenAI costs ~$0.15/itinerary generation.

---

## Repository Structure

```
ando/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx       # Login page
│   │   └── callback/route.ts    # Supabase auth callback
│   ├── (app)/
│   │   ├── layout.tsx           # App shell (nav, auth guard)
│   │   ├── dashboard/page.tsx   # My trips list
│   │   ├── trips/
│   │   │   ├── new/page.tsx     # Create trip form
│   │   │   └── [id]/page.tsx    # Trip + itinerary view
│   │   └── onboarding/page.tsx  # Travel style quiz (first login)
│   └── api/
│       ├── itineraries/
│       │   └── generate/route.ts  # POST — calls OpenAI
│       └── trips/
│           └── route.ts           # CRUD
├── components/
│   ├── ui/                      # Button, Card, Input, Badge
│   ├── trip/
│   │   ├── TripForm.tsx         # New trip form
│   │   └── TripCard.tsx         # Trip list item
│   └── itinerary/
│       ├── ItineraryView.tsx    # Full day-by-day view
│       ├── DayCard.tsx          # Single day
│       └── ActivityItem.tsx     # Single activity
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client (for API routes)
│   ├── openai/
│   │   ├── client.ts            # OpenAI instance
│   │   └── prompts.ts           # System prompt + user prompt builder
│   └── types.ts                 # Shared TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.local                   # NEXT_PUBLIC_SUPABASE_URL, keys, OPENAI_API_KEY
└── CLAUDE.md                    # This file
```

---

## Database Schema

This is the most important section. **Do not deviate from this schema.** It is designed to carry forward into the full product with no breaking migrations.

```sql
-- supabase/migrations/001_initial_schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    VARCHAR(100),
    avatar_url      TEXT,
    travel_style    JSONB DEFAULT '{}',
    -- {"pace": "slow|medium|fast", "budget": "budget|mid|luxury", "interests": ["food","art","nature"]}
    preferences     JSONB DEFAULT '{}',
    -- {"dietary": ["vegetarian"], "accessibility": [], "accommodation": "hostel|hotel|airbnb"}
    onboarded       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE public.trips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title           VARCHAR(255),
    destination     VARCHAR(255) NOT NULL,
    country_code    CHAR(2),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    traveler_count  INT DEFAULT 1,
    budget_total    DECIMAL(10,2),
    currency        CHAR(3) DEFAULT 'USD',
    status          VARCHAR(20) DEFAULT 'draft',
    -- draft | active | completed | archived
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Itineraries
CREATE TABLE public.itineraries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    version         INT DEFAULT 1,
    generated_at    TIMESTAMPTZ DEFAULT NOW(),
    ai_model        VARCHAR(50),
    prompt_hash     CHAR(64),
    days            JSONB NOT NULL DEFAULT '[]',
    is_active       BOOLEAN DEFAULT TRUE
);

-- Row Level Security (critical — users can only see their own data)
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own trips"
    ON public.trips FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own itineraries"
    ON public.itineraries FOR ALL
    USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_trips_user_id     ON public.trips(user_id);
CREATE INDEX idx_trips_status      ON public.trips(status);
CREATE INDEX idx_itineraries_trip  ON public.itineraries(trip_id, is_active);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_trips_updated_at
    BEFORE UPDATE ON public.trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Data Integrity Rules

These are invariants — rules that must always be true in the database. Claude Code must never violate these regardless of the step being implemented.

**Rule 1 — Every authenticated user must always have a profiles row.**
Profile creation happens in the auth callback immediately after login using upsert with `onConflict: 'id'`. Never rely on onboarding to create the row. Onboarding only updates an existing row.

```typescript
// In auth callback — runs on every login, safe to repeat
await supabase.from("profiles").upsert(
  {
    id: user.id,
    display_name: user.user_metadata.full_name,
    avatar_url: user.user_metadata.avatar_url,
    onboarded: false,
  },
  { onConflict: "id" },
); // no-op if row already exists
```

```typescript
// In onboarding submit — updates existing row only
await supabase
  .from("profiles")
  .update({
    travel_style: { pace, budget, interests },
    preferences: { dietary },
    onboarded: true,
  })
  .eq("id", user.id);
```

**Rule 2 — Never assume a profiles row is complete.**
Always handle the case where `travel_style` or `preferences` is an empty object `{}`. Use optional chaining and fallbacks everywhere:

```typescript
profile.travel_style?.pace ?? "medium";
profile.travel_style?.interests ?? [];
profile.preferences?.dietary ?? [];
```

**Rule 3 — Trip must always belong to an existing profile.**
The foreign key `trips.user_id → profiles.id` enforces this at the DB level. Never create a trip before confirming the profiles row exists.

---

## AI Itinerary Generation

### The API Route

```typescript
// app/api/itineraries/generate/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/client";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/openai/prompts";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tripId } = await req.json();

  // Fetch trip + user profile
  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!trip || trip.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Call OpenAI — synchronous, no queue needed at this scale
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(trip, profile) },
    ],
  });

  const days = JSON.parse(completion.choices[0].message.content!).days;

  // Deactivate previous versions
  await supabase
    .from("itineraries")
    .update({ is_active: false })
    .eq("trip_id", tripId);

  // Save new itinerary
  const { data: itinerary } = await supabase
    .from("itineraries")
    .insert({
      trip_id: tripId,
      ai_model: "gpt-4o",
      days,
      is_active: true,
    })
    .select()
    .single();

  return NextResponse.json({ itinerary });
}
```

### The Prompts

```typescript
// lib/openai/prompts.ts

export function buildSystemPrompt(): string {
  return `You are Ando, a world-class travel planner.
Generate practical, personalized day-by-day travel itineraries.

Rules:
- Respect the traveler's pace (slow = 2-3 activities/day, medium = 3-4, fast = 5+)
- Account for realistic travel time between activities
- Include specific cost estimates in the user's currency
- Flag any booking requirements (skip-the-line tickets, reservations)
- Meals must respect dietary restrictions
- Include a daily theme and walking distance estimate

Output ONLY valid JSON in this exact format:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "walking_km": number,
      "estimated_cost": number,
      "activities": [
        {
          "time": "HH:MM",
          "duration_min": number,
          "name": "string",
          "category": "attraction|restaurant|transport|accommodation|experience",
          "description": "string",
          "notes": "string or null",
          "cost_estimate": number,
          "travel_to_next": { "mode": "string", "duration_min": number } or null
        }
      ]
    }
  ]
}`;
}

export function buildUserPrompt(trip: any, profile: any): string {
  const days =
    Math.ceil(
      (new Date(trip.end_date).getTime() -
        new Date(trip.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  return `Create a ${days}-day itinerary for ${trip.destination}.

Traveler profile:
- Budget level: ${profile.travel_style?.budget ?? "mid"}
- Total budget: ${trip.budget_total ? `${trip.currency} ${trip.budget_total}` : "not specified"}
- Travel pace: ${profile.travel_style?.pace ?? "medium"}
- Interests: ${(profile.travel_style?.interests ?? []).join(", ") || "general sightseeing"}
- Dietary restrictions: ${(profile.preferences?.dietary ?? []).join(", ") || "none"}
- Travelers: ${trip.traveler_count}
- Accommodation type: ${profile.preferences?.accommodation ?? "hotel"}

Trip dates: ${trip.start_date} to ${trip.end_date}
Currency: ${trip.currency}`;
}
```

---

## Screen Flow

```
/login
  └── Google OAuth → /onboarding (first time) or /dashboard (returning)

/onboarding
  └── Travel style quiz (pace, budget, interests, dietary)
  └── Saves to profiles.travel_style + profiles.preferences
  └── → /dashboard

/dashboard
  └── List of user's trips (TripCard components)
  └── "Plan a new trip" button → /trips/new

/trips/new
  └── Form: destination, dates, travelers, budget
  └── Submit → creates trip record → calls /api/itineraries/generate
  └── Loading state (spinner with "Ando is planning your trip...")
  └── → /trips/[id]

/trips/[id]
  └── Trip header (destination, dates)
  └── ItineraryView (day-by-day)
      └── DayCard × N days
          └── ActivityItem × N activities per day
  └── "Regenerate" button (calls generate API again)
```

---

## Build Order

Work through these in sequence. Each step produces something usable.

### Step 1 — Project Foundation ✅ Complete

```
- [x] npx create-next-app@latest ando --typescript --tailwind --app
- [x] Install dependencies: @supabase/supabase-js @supabase/ssr openai @tanstack/react-query sentry
- [x] Set up .env.local with Supabase + OpenAI keys
- [x] Run Supabase migration (001_initial_schema.sql)
- [x] Verify Supabase RLS is working (test in Supabase dashboard)
- [x] Deploy empty app to Vercel — confirm CI/CD works from day one
```

### Step 2 — Auth ✅ Complete

```
- [x] Supabase Auth with Google provider (configure in Supabase dashboard)
- [x] lib/supabase/client.ts and server.ts
- [x] /login page with Google button
- [x] Auth callback route (/app/(auth)/callback/route.ts)
- [x] Middleware to protect /app routes (redirect to /login if no session)
- [x] Test: can log in, session persists on refresh
```

### Step 3 — Onboarding

```
- [x] /onboarding page with travel style quiz
- [x] 4 questions: pace, budget level, interests (multi-select), dietary restrictions
- [x] On submit: upsert to profiles table, set onboarded=true
- [x] Redirect logic: if !onboarded → /onboarding, else → /dashboard
- [x] Test: new user lands on quiz, returning user skips it
```

### Step 4 — Trip Creation

```
- [ ] /dashboard page showing trip list (empty state with CTA)
- [ ] /trips/new form (destination, start_date, end_date, traveler_count, budget)
- [ ] POST /api/trips route to create trip record
- [ ] TripCard component for dashboard list
- [ ] Test: create a trip, see it on dashboard
```

### Step 5 — AI Generation (core feature)

```
- [ ] lib/openai/client.ts and prompts.ts
- [ ] POST /api/itineraries/generate route
- [ ] Trigger generation automatically after trip creation
- [ ] Loading state on /trips/[id] while generating
- [ ] ItineraryView, DayCard, ActivityItem components
- [ ] Test: generate an itinerary for a real destination, verify output quality
```

### Step 6 — Polish, PWA & Invite Friends

```
- [ ] Error handling (OpenAI timeout, failed generation → friendly message)
- [ ] Regenerate button on itinerary view
- [ ] Mobile-responsive layout (test on iPhone Safari + Android Chrome)
- [ ] Sentry error tracking wired up
- [ ] PWA setup — add to home screen support:
      - [ ] Create public/manifest.json (app name, icons, theme color)
      - [ ] Add <link rel="manifest"> to app/layout.tsx
      - [ ] Create 192x192 and 512x512 app icons (public/icons/)
      - [ ] Set viewport meta tag for mobile fullscreen feel
      - [ ] Test: open on iPhone Safari → Share → Add to Home Screen → launches fullscreen
- [ ] Share link to /trips/[id] (send to friends to preview their itinerary)
- [ ] Invite 3–5 friends via link, watch them use it, take notes
```

---

## What to Measure (manually at this stage)

No analytics dashboards needed. Just pay attention to:

- Did they complete the trip form without asking you for help?
- Did they open the itinerary and read it, or ignore it?
- Did they hit Regenerate? What did they say was wrong?
- Did they reference Ando during the actual trip?
- Would they use it for their next trip without being asked?

That last question is the only metric that matters right now.

---

## What's Deliberately Left Out

These are real features but they do not belong in this version:

| Feature                      | Why it's out                                                                               | When to add it                               |
| ---------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Async job queue (SQS/BullMQ) | OpenAI is fast enough for 20 users                                                         | When >50 concurrent users cause timeouts     |
| Redis caching                | Supabase handles this load easily                                                          | When DB queries exceed 100ms consistently    |
| Elasticsearch                | Postgres FTS is sufficient                                                                 | When place search becomes a bottleneck       |
| Offline mode                 | Friends will have internet                                                                 | When real travelers use it in the field      |
| Push notifications           | Email works for now                                                                        | When async generation is introduced          |
| Booking links                | Distraction from core value                                                                | Phase 2                                      |
| Social features              | Not needed to validate core                                                                | Phase 3                                      |
| Mobile app (React Native)    | PWA covers friends stage; native app when App Store presence justified                     | When retention data justifies the investment |
| GraphQL API                  | Supabase client is sufficient for web; GraphQL added when React Native mobile app is built | When React Native mobile app is introduced   |
| Fine-tuned model             | GPT-4o is good enough to validate                                                          | When you hit $500+/month in LLM costs        |

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-side only, never expose
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000           # update for production
```

---

## When to Graduate to the Full Architecture

You'll know it's time when you see **at least two** of these:

- [ ] Strangers (not just friends) are signing up organically
- [ ] Users are returning for a second or third trip
- [ ] OpenAI generation is timing out for some users (>30s)
- [ ] You have more than 200 active users
- [ ] Someone asks to pay for it

Until then, **do not touch the system design doc.** Keep building on this stack.

---

## Agents & Roles

At this stage, one person can own everything. There is no need to split responsibilities across agents or contributors. The codebase is small enough to hold in one head.

| Role      | Owner        | Scope                                           |
| --------- | ------------ | ----------------------------------------------- |
| Architect | Claude       | Schema design, API design, stack decisions      |
| Builder   | You          | Implementation, shipping, testing               |
| Product   | You          | Which features matter, talking to users         |
| QA        | Your friends | Using it on real trips, reporting what's broken |

When the time comes to expand, split it like this:

- **Frontend agent** — components, routing, mobile responsiveness
- **Backend agent** — API routes, database, OpenAI integration
- **DevOps agent** — infra, deployment, monitoring (only needed at Phase 2+)

---

_Maintained by: Ando Engineering_  
_Last updated: February 2026 — Step 1 complete_  
_Next review: When first 5 friends have used it on a real trip_

---

## Architecture Decisions Log

| Date     | Decision                                     | Rationale                                                                                                                                      |
| -------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Feb 2026 | Web app (Next.js) before React Native        | Faster to ship, easier to iterate, web familiar. Friends can use via browser or Add to Home Screen.                                            |
| Feb 2026 | PWA instead of native app for friends stage  | No App Store friction. Friends get home screen icon via Safari/Chrome share sheet. Feels like an app.                                          |
| Feb 2026 | Supabase client instead of GraphQL           | GraphQL overhead not justified for single web client. Introduce GraphQL when React Native app is built and multiple clients need a shared API. |
| Feb 2026 | Supabase Auth instead of Auth0               | Free tier sufficient. Same OAuth 2.0 standard. Swap to Auth0 only if enterprise SSO is needed.                                                 |
| Feb 2026 | Synchronous OpenAI call instead of job queue | 5–15 second wait acceptable for 20 users. Add BullMQ queue when concurrent generation causes timeouts.                                         |

---

## Bug & Edge Case Log

A record of issues discovered, how we found them, the decision made, and why. Use this to understand past mistakes and avoid repeating them.

---

### Edge Case 001 — Profile row not created on first login

**Date:** February 2026  
**Discovered by:** Founder reviewing Supabase Table Editor after Step 2  
**Stage discovered:** After Step 2 (Auth) was built, before Step 3 (Onboarding) ran

**What happened:**
After completing Google OAuth login in Step 2, the founder checked the Supabase Table Editor and noticed `public.profiles` was empty. The original architecture assumed the onboarding quiz (Step 3) would create the profiles row on form submit. No code existed to create the row at login time.

**Why it was missed:**
The schema and onboarding logic were each designed correctly in isolation. The gap was at the boundary between them — the transition from `auth.users` (Supabase-managed) to `public.profiles` (our table) was never explicitly documented as a responsibility. The architect (Claude) designed each component without stress-testing the seams between them.

**The risk if left unfixed:**
A user could log in, close the browser before finishing onboarding, and return later with no profiles row. Any code that queries profiles and assumes a row exists would throw an error. The onboarding redirect check (`!onboarded → /onboarding`) would fail silently or crash instead of gracefully redirecting.

**Decision made:**
Split profile lifecycle into two distinct responsibilities:

1. **Auth callback** — always creates the profiles row via upsert with `onConflict: 'id'` immediately after every login. Safe to run on repeat logins — no-op if row already exists.
2. **Onboarding submit** — only updates the existing row with travel style, preferences, and `onboarded=true`. Never creates.

This guarantees every authenticated user always has a profiles row regardless of whether they complete onboarding.

**Why this approach over alternatives:**

- Considered using a Supabase database trigger on `auth.users` insert to auto-create the profiles row. Rejected because triggers are invisible to the codebase — a future developer wouldn't know the row was being created there, making debugging harder.
- Considered creating the row lazily on first dashboard load. Rejected because it spreads the responsibility across multiple places and still leaves gaps.
- Chosen approach keeps the logic in one explicit place (auth callback), is readable, and is documented here and in Data Integrity Rules.

**Fix applied:** Step 3 was already built before this was caught. A retroactive fix prompt was given to Claude Code to update the auth callback to add the upsert, and to update onboarding to only call update (not upsert). Data Integrity Rules section added to CLAUDE.md to prevent similar gaps in future steps.

**Lesson:** Before building each step, explicitly map the data lifecycle at the boundaries — who creates each row, who updates it, and what happens if the user drops off mid-flow.

---

### Edge Case 007 — Dashboard accessible mid-session even if onboarded: false

**Date:** February 2026  
**Discovered by:** Founder testing manually — set onboarded: false in Supabase without logging out, dashboard still loaded  
**Stage:** Discovered during Step 3 verification

**What happened:**
The onboarding redirect check only runs in the auth callback at login time. Once a session is established, navigating directly to `/dashboard` bypasses the check entirely. A user who abandons onboarding mid-session, or whose profile is manually reset, can still access the dashboard with an incomplete profile.

**The risk if left unfixed:**
User reaches dashboard with empty `travel_style` and `preferences`. When they create a trip and generate an itinerary, the prompt falls back to all defaults — generic itinerary with no personalization. Worse, if any dashboard code assumes profile data exists, it could throw an error.

**Decision made:**
Add a server-side onboarding guard directly in `app/(app)/dashboard/page.tsx`. It fetches the profile using the server Supabase client before the page renders. If `onboarded: false` or profile is missing, it redirects to `/onboarding`. This runs on every dashboard load regardless of session state.

```typescript
// app/(app)/dashboard/page.tsx
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarded) redirect("/onboarding");

  // safe to render dashboard
}
```

**Why not handle this in middleware instead?**
Middleware runs on every request and doesn't have easy access to database data — it only sees cookies and headers. Fetching the profile in middleware would add a Supabase round-trip to every single page load, including static assets. Keeping the check in the dashboard page itself keeps it targeted and efficient.

**Fix applied:** Retroactive fix prompt given to Claude Code after Step 3 was built.

**Lesson:** Auth callback guards protect the login flow. Page-level guards protect direct navigation. Both are needed. Any page that requires a complete profile should have its own server-side check.

---

### Edge Case 002 — OpenAI returns malformed or unexpected JSON

**Date:** February 2026  
**Discovered by:** Architect review before Step 5  
**Stage:** Not yet built — catch before Step 5

**What happened:**
The generation route has no error handling around the OpenAI response. `JSON.parse(completion.choices[0].message.content!).days` throws an uncaught exception if OpenAI times out, refuses the request, or returns anything other than valid JSON. The trip record exists in the database but no itinerary is ever saved, leaving the user on a broken page with no explanation.

**The risk if left unfixed:**
Silent failures that look like bugs to the user. No way to retry because the UI has no error state. No record in the database of what went wrong.

**Decision made:**
Wrap the entire OpenAI call and JSON parse in a try/catch. On failure, return a structured error response the UI can display. Add a `generation_status` field to the itinerary insert — values: `pending`, `complete`, `failed` — so the UI always knows what state it's in.

**Fix:** Address in Step 5 before building the generation route.

---

### Edge Case 003 — User hits Regenerate while generation is already running

**Date:** February 2026  
**Discovered by:** Architect review before Step 5  
**Stage:** Not yet built — catch before Step 5

**What happened:**
The regenerate flow deactivates previous itineraries then inserts a new one. Two concurrent calls racing could result in both deactivating each other, or a second insert overwriting the first before it completes.

**The risk if left unfixed:**
Zero active itineraries for a trip, or a half-written itinerary displayed to the user.

**Decision made:**
Disable the Regenerate button immediately on click and re-enable only when the response returns (success or error). A simple `isGenerating` boolean in React state is sufficient at this scale. No server-side locking needed for 20 users.

**Fix:** Address in Step 5 when building the Regenerate button.

---

### Edge Case 004 — Invalid trip dates crash the generation prompt

**Date:** February 2026  
**Discovered by:** Architect review before Step 4  
**Stage:** Not yet built — catch before Step 4

**What happened:**
No validation exists to ensure `end_date` is after `start_date`, or that the trip duration is reasonable. If `end_date` is before `start_date`, the days calculation returns 0 or negative. If the trip is 60+ days, the prompt is enormous and likely hits OpenAI's context limit.

**The risk if left unfixed:**
Nonsensical prompts sent to OpenAI, failed generations, or token limit errors with no user feedback.

**Decision made:**
Add client-side validation in the trip form:

- `end_date` must be after `start_date`
- Maximum trip duration of 21 days for this stage (keeps prompt size manageable)
- Show inline error messages, do not allow form submission if invalid

**Fix:** Address in Step 4 when building the trip creation form.

---

### Edge Case 005 — Vercel free tier 60-second timeout

**Date:** February 2026  
**Discovered by:** Architect review before Step 5  
**Stage:** Not yet built — monitor in Step 5

**What happened:**
Vercel serverless functions time out at 60 seconds on the free tier. OpenAI can take 15–30 seconds for longer itineraries. A 14-day trip on a slow OpenAI response risks hitting this limit. The function times out, Vercel returns a 504, and the trip is left in a broken state with no itinerary and no error recorded.

**The risk if left unfixed:**
Users on longer trips get silent failures. No way to detect or retry from the UI.

**Decision made:**
Cap trip duration at 14 days for now (also mitigates Edge Case 004). Add OpenAI timeout configuration of 45 seconds, leaving buffer before Vercel's limit. If we hit this in testing, upgrade to Vercel Pro (300s limit) before inviting friends. Add this to the graduation checklist.

**Fix:** Cap enforced in Step 4 form validation. Timeout configured in Step 5.

---

### Edge Case 006 — Service role key bypasses RLS

**Date:** February 2026  
**Discovered by:** Architect review  
**Stage:** Ongoing — audit every step

**What happened:**
`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely by design — it's meant for admin operations only. If Claude Code accidentally uses the service role client in API routes instead of the regular server client, RLS stops protecting user data. Any user could potentially access any other user's trips.

**The risk if left unfixed:**
Complete data exposure. User A can read, modify, or delete User B's trips.

**Decision made:**
Service role client must only be used for operations that legitimately need to bypass RLS — none exist in this MVP. All API routes use the regular server client (`lib/supabase/server.ts`) which respects RLS. Add a code comment to the service role client file warning against use in API routes.

**Fix:** Audit `lib/supabase/server.ts` and all API routes in Step 5 to confirm service role key is never used in request handlers.
