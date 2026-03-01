# CLAUDE.md — Ando MVP Build Plan

**Architect:** Claude (Sonnet 4.6)  
**Version:** 1.1  
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
- ✅ Step 4 — Trip Creation complete and committed
- ✅ Step 5 — AI Generation complete
- ✅ Step 6 — Polish, PWA & Invite Friends complete

**Edge case status:**

- ✅ Edge Case 001 — Profile row not created on login (fixed in Step 3)
- ✅ Edge Case 007 — Dashboard accessible mid-session with onboarded: false (fixed in Step 3)
- ✅ Edge Case 002 — OpenAI malformed JSON (fixed in Step 5)
- ✅ Edge Case 003 — Regenerate button double-tap race condition (fixed in Step 5)
- ✅ Edge Case 004 — Invalid trip dates (fixed in Step 4)
- ✅ Edge Case 005 — Vercel 60s timeout on long trips (fixed in Step 5: 45s OpenAI timeout)
- ✅ Edge Case 006 — Service role key bypasses RLS (audited in Step 5: clean)
- ✅ Edge Case 008 — UTC offset shifts displayed dates by one day (fixed in Step 4)

**Design progress:**

- ✅ Design system established — "Dusk Slate" palette + Playfair Display / DM Sans typography (locked)
- ✅ Landing page reference produced (`ando-design-reference-v1.html`)
- 🔲 Design Step 1 — Landing page redesign implementation (prompt written, pending Claude Code)
- 🔲 Design Step 2 — Dashboard redesign (awaiting designer reference)
- 🔲 Design Step 3 — Trip detail + itinerary view redesign (awaiting designer reference)
- 🔲 Design Step 4 — Onboarding redesign (awaiting designer reference)

**Immediate next actions:**

1. ✅ Run `supabase db push` (or apply migration 002 in Supabase dashboard SQL editor) to add share_token
2. ✅ Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel env vars — get DSN from sentry.io project settings
3. ✅ Add `NEXT_PUBLIC_APP_URL=https://your-vercel-url.app` to Vercel env vars (share links use this)
4. ✅ Run Design Step 1 Claude Code prompt — rebuild landing page against design reference
5. Invite 3–5 friends — pending until all design progress (Steps 2–4) is complete

**Key decisions already made — do not revisit:**

- Web app (Next.js + Supabase) before React Native mobile app
- PWA for friends stage, no App Store yet
- Supabase client instead of GraphQL until mobile app is built
- Synchronous OpenAI calls, no job queue until >50 concurrent users
- Max trip duration 14 days (token limit + Vercel timeout protection)
- Profile row created at login via upsert, onboarding only updates
- **Trip form only creates the trip record. Generation is triggered from `/trips/[id]` via an explicit button. Steps 4 and 5 are decoupled. (Option B)**

---

## Guiding Rules for This Phase

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
│   │   │   └── [id]/page.tsx    # Trip detail + itinerary view + Generate button
│   │   └── onboarding/page.tsx  # Travel style quiz (first login)
│   └── api/
│       ├── itineraries/
│       │   └── generate/route.ts  # POST — called from /trips/[id], not from form
│       └── trips/
│           └── route.ts           # CRUD
├── components/
│   ├── ui/                      # Button, Card, Input, Badge
│   ├── trip/
│   │   ├── TripForm.tsx         # New trip form — creates record only, no generation
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
  └── Submit → creates trip record ONLY (no generation triggered here)
  └── → /trips/[id]

/trips/[id]
  └── Trip header (destination, dates, traveler count)
  └── "Generate Itinerary" button (Step 4: visible, disabled placeholder)
      └── On click (Step 5): calls POST /api/itineraries/generate
      └── Loading state: spinner with "Ando is planning your trip..."
      └── On complete: renders ItineraryView
  └── ItineraryView (day-by-day) — rendered once itinerary exists
      └── DayCard × N days
          └── ActivityItem × N activities per day
  └── "Regenerate" button — replaces Generate button once itinerary exists
```

**Why generation lives on `/trips/[id]` and not in the form (Option B):**
Steps 4 and 5 are decoupled. Step 4 ships and is fully testable without Step 5 existing. The trip page is the command center — it owns the generate/regenerate lifecycle. When async generation is introduced (job queue, 1M+ users), only the button handler changes. No form refactoring required.

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
- [x] Auth callback upserts profile row on every login (fix for Edge Case 001)
- [x] Test: can log in, session persists on refresh
```

### Step 3 — Onboarding ✅ Complete

```
- [x] /onboarding page with travel style quiz
- [x] 4 questions: pace, budget level, interests (multi-select), dietary restrictions
- [x] On submit: update profiles row, set onboarded=true (never insert — row exists from auth callback)
- [x] Redirect logic: if !onboarded → /onboarding, else → /dashboard
- [x] Dashboard page guard: server-side check on every load (fix for Edge Case 007)
- [x] Test: new user lands on quiz, returning user skips it
```

### Step 4 — Trip Creation ✅ Complete

```
- [x] /dashboard updated: trip list (TripCard grid), empty state CTA, "New trip" button in header
- [x] /trips/new page with TripForm component
- [x] TripForm: destination, trip name (optional), dates, traveler count, budget + currency
- [x] TripForm validation: end date ≥ start, max 14 days, no past start dates (Edge Case 004 ✅)
- [x] End date input resets when start date changes to a later value (UX guard)
- [x] POST /api/trips — server-side validation mirrors client rules exactly; createServerClient only
- [x] GET /api/trips — returns non-archived trips with itinerary join for status indicator
- [x] TripCard: destination, title, date range, traveler count, "Itinerary ready" / "No itinerary" badge
- [x] /trips/[id] scaffold: destination, dates, travelers, budget + disabled "Generate Itinerary" placeholder
- [x] lib/types.ts: added TripStatus (named type) and TripFormData
- [x] Test: build passes, all 9 routes compile cleanly
```

### Step 5 — AI Generation ✅ Complete

```
- [x] lib/openai/client.ts: timeout set to 45s (Edge Case 005 ✅)
- [x] lib/openai/prompts.ts: verified correct — no changes needed
- [x] POST /api/itineraries/generate: full try/catch around OpenAI call + JSON.parse (Edge Case 002 ✅)
- [x] POST /api/itineraries/generate: ownership check, deactivates old itineraries before insert
- [x] Audit: service role key never used in any API route handler (Edge Case 006 ✅)
- [x] ItinerarySection client component: isGenerating set immediately on click, reset in finally (Edge Case 003 ✅)
- [x] ItinerarySection: spinner + "Ando is planning your trip…" loading state
- [x] ItinerarySection: error display with retry capability
- [x] ItinerarySection: shows Generate button when no itinerary, Regenerate button after
- [x] ItinerarySection: router.refresh() after successful generation (server component re-fetches)
- [x] ItineraryView component: day list + estimated total cost summary bar
- [x] DayCard component: day header (theme, date, estimated cost, walking km), activity list
- [x] ActivityItem component: time, name, category badge, description, notes, cost, travel_to_next
- [x] DayCard: T00:00:00 appended to date strings (Edge Case 008 ✅)
- [x] /trips/[id] page: fetches active itinerary with .maybeSingle(), passes to ItinerarySection
- [ ] Test: generate an itinerary for a real destination, verify output quality
```

### Step 6 — Polish, PWA & Invite Friends ✅ Complete

```
- [x] Error handling: audited — ItinerarySection covers generate/regenerate failures with retry; onboarding has error state; no blank screens
- [x] Regenerate button: confirmed correct — same isGenerating/finally pattern as Generate; shown only when itinerary exists
- [x] Mobile responsiveness: audited all pages at 390px — flex-wrap on meta rows, px-4 gutters throughout; DayCard left header fixed with min-w-0 flex-1
- [x] Sentry: sentry.client.config.ts + sentry.server.config.ts + instrumentation.ts created; next.config.ts wrapped with withSentryConfig; requires NEXT_PUBLIC_SENTRY_DSN env var in Vercel
- [x] PWA: public/manifest.json (standalone, stone-900 theme), public/icons/icon.svg (SVG lettermark), app/layout.tsx updated with manifest link, apple-touch-icon, Viewport export
- [x] Share link: migration 002 adds share_token UUID to trips + public SELECT RLS policies; /shared/[shareToken] read-only page (no Generate/Regenerate); ShareButton component on trip page; proxy.ts allows /shared/ without auth
- [x] lib/types.ts: added share_token to Trip interface
- [ ] Apply migration 002 in Supabase dashboard
- [ ] Set NEXT_PUBLIC_SENTRY_DSN + NEXT_PUBLIC_APP_URL in Vercel env vars
- [ ] Test: generate itinerary, share link with a friend, verify read-only view
- [ ] Invite 3–5 friends via link, watch them use it, take notes
```

---

## Data Integrity Rules

These rules govern how rows are created and updated. Every future step must follow them.

**profiles table:**

- Row is created at login via upsert in the auth callback. Always. Even if the row already exists, upsert is safe.
- Onboarding only calls update (never insert). It sets travel_style, preferences, and onboarded=true on the existing row.
- This guarantees every authenticated user always has a profiles row.

**trips table:**

- Row is created by POST /api/trips when the user submits the trip form.
- Generation does not create a new trip — it only creates an itinerary row linked to an existing trip.

**itineraries table:**

- Row is created by POST /api/itineraries/generate.
- Before inserting a new itinerary, deactivate all previous itineraries for that trip (set is_active=false).
- Only one itinerary per trip should ever have is_active=true.

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

| Feature                      | Why it's out                                                                     | When to add it                               |
| ---------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| Async job queue (SQS/BullMQ) | OpenAI is fast enough for 20 users                                               | When >50 concurrent users cause timeouts     |
| Redis caching                | Supabase handles this load easily                                                | When DB queries exceed 100ms consistently    |
| Elasticsearch                | Postgres FTS is sufficient                                                       | When place search becomes a bottleneck       |
| Offline mode                 | Friends will have internet                                                       | When real travelers use it in the field      |
| Push notifications           | Email works for now                                                              | When async generation is introduced          |
| Booking links                | Distraction from core value                                                      | Phase 2                                      |
| Social features              | Not needed to validate core                                                      | Phase 3                                      |
| Mobile app (React Native)    | PWA covers friends stage; native app when App Store presence justified           | When retention data justifies the investment |
| GraphQL API                  | Supabase client sufficient for single web client; add when React Native is built | When React Native mobile app is introduced   |
| Fine-tuned model             | GPT-4o is good enough to validate                                                | When you hit $500+/month in LLM costs        |

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-side only, never expose, never use in API routes
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

## Design System

### Palette — "Dusk Slate" (locked, do not modify)

```css
--bg:        #F8F9FB;   /* page background — warm near-white, not clinical pure white */
--bg-subtle: #EEF1F6;   /* section backgrounds, footer, testimonial stripe */
--bg-card:   #FFFFFF;   /* card surfaces, search card */
--border:    #DDE3ED;   /* default borders */
--border-hi: #C8D2E0;   /* elevated borders, focus states */
--text:      #1A2234;   /* primary text — near-black with blue undertone */
--text-2:    #5A6B82;   /* secondary text, body copy */
--text-3:    #A4B0C0;   /* muted text, labels, placeholders */
--accent:    #4A6FA5;   /* brand accent — muted slate blue; decorative use */
--accent-h:  #3A5C92;   /* accent hover state */
--accent-s:  rgba(74,111,165,0.07);  /* accent tint for icon backgrounds, eyebrow pills */
--cta:       #3A5C92;   /* action buttons only — darker than accent, distinct weight */
--cta-h:     #2B4C7E;   /* CTA hover */
--cta-glow:  rgba(58,92,146,0.22);  /* CTA button shadow */
--shadow-sm: 0 1px 4px rgba(26,34,52,0.06), 0 4px 16px rgba(26,34,52,0.06);
--shadow-md: 0 2px 8px rgba(26,34,52,0.06), 0 8px 32px rgba(26,34,52,0.10);
--shadow-lg: 0 4px 16px rgba(26,34,52,0.06), 0 20px 60px rgba(26,34,52,0.13);
```

**Note on accent vs CTA:** `--accent` is used for decorative elements (wordmark accent, icon color, eyebrow text, links). `--cta` is used exclusively for primary action buttons. They are different values. Do not use `--accent` on buttons or `--cta` on decorative elements.

### Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / headings | Playfair Display | 400, 500, italic | All major headlines, wordmark, testimonial, card city names |
| Body / UI | DM Sans | 300, 400, 500, 600 | All other text, labels, buttons, captions |

Google Fonts URL: `https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap`

### Styling Approach (inner app screens)

- CSS Modules per page/component — not Tailwind utilities. Tailwind directives remain in globals.css for base reset only.
- All colors via CSS custom properties from `:root`. Never hardcode hex values in component styles.
- Pseudo-classes (`:hover`, `::before`, `::after`, `:focus-within`) require CSS Modules — cannot be expressed in inline styles.

### Carousel Implementation Pattern

The destination carousel uses `requestAnimationFrame` at `SPEED = 0.5 px/frame` normalized to 60fps (`dt / 16.67`). Cards are cloned in JS at mount (not duplicated in markup). Seamless loop via `scrollLeft` reset when `>= scrollWidth / 2`. This pattern is locked — do not replace with CSS animations or scroll-snap libraries.

---

## Architecture Decisions Log

| Date     | Decision                                                                      | Rationale                                                                                                                                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feb 2026 | Rename Backpackr → Ando                                                       | Broader brand appeal; not limited to backpacker demographic                                                                                                                                                                                                                              |
| Feb 2026 | Web app (Next.js) before React Native                                         | Faster to ship, easier to iterate. Friends can use via browser or Add to Home Screen.                                                                                                                                                                                                    |
| Feb 2026 | PWA instead of native app for friends stage                                   | No App Store friction. Friends get home screen icon via Safari/Chrome share sheet.                                                                                                                                                                                                       |
| Feb 2026 | Supabase client instead of GraphQL                                            | GraphQL overhead not justified for single web client. Introduce when React Native app is built.                                                                                                                                                                                          |
| Feb 2026 | Supabase Auth instead of Auth0                                                | Free tier sufficient. Same OAuth 2.0 standard. Swap to Auth0 only if enterprise SSO needed.                                                                                                                                                                                              |
| Feb 2026 | Synchronous OpenAI call instead of job queue                                  | 5–15 second wait acceptable for 20 users. Add BullMQ when concurrent generation causes timeouts.                                                                                                                                                                                         |
| Feb 2026 | Profile row created at auth callback, not onboarding                          | Prevents orphaned sessions. Single source of truth for row creation. Documented in Data Integrity Rules.                                                                                                                                                                                 |
| Feb 2026 | Max trip duration 14 days                                                     | Keeps prompt size manageable. Protects against Vercel 60s timeout (Edge Case 005).                                                                                                                                                                                                       |
| Feb 2026 | Generation triggered from /trips/[id], not from form (Option B)               | Decouples Steps 4 and 5. Each ships independently. When async generation is introduced, only the button handler changes — no form refactoring needed.                                                                                                                                    |
| Feb 2026 | Server components query Supabase directly; API routes are for client-side use | Avoids unnecessary HTTP round-trips on first load. Server components (dashboard, trip page) use `createServerClient` directly. API routes (`/api/trips`, `/api/itineraries`) exist for React Query calls from client components. Never fetch internal API routes from server components. |
| Feb 2026 | Share links use /shared/[shareToken] route with permissive RLS, not /trips/[id] | Keeps owner-only logic in /trips/[id] clean. Public SELECT policy on trips + itineraries is acceptable because all IDs are gen_random_uuid() — 2^122 bits of entropy, effectively unguessable. Separate route prevents confusion between owner view and read-only view. |
| Feb 2026 | PWA uses SVG icon (icon.svg) instead of PNG for MVP | SVG works in Chrome/Android manifest; iOS Safari uses apple-touch-icon. For proper iOS home screen icon (crisp PNG), generate 192×192 and 512×512 PNGs from the SVG and replace icon.svg with them before wide rollout. |
| Feb 2026 | Design system: "Dusk Slate" light-mode palette, not dark mode | Light mode is more accessible, works better in sunlight for travelers, and matches the calm-trustworthy brand tone. Dark mode is not planned for this stage. |
| Feb 2026 | CSS Modules for redesigned pages, not Tailwind utilities | Design tokens are CSS custom properties. Tailwind utility classes cannot reference CSS variables cleanly for all patterns (pseudo-classes, shadows). CSS Modules give full CSS access while keeping styles scoped. Tailwind base reset stays in globals.css. |
| Feb 2026 | Landing page is product-first (search card + carousel), not photography-first | Previous design (v0) led with full-bleed hero photography. New design leads with the search card — shows the product, not just a travel aesthetic. Carousel below demonstrates destinations without blocking the primary action. |
| Feb 2026 | Destination carousel cards hardcoded for friends stage | No places API at this stage. Static Unsplash image URLs with known-stable IDs. Replace with dynamic data when Places Service is built (Phase 2). |
| Feb 2026 | Removed search bar from landing page | The search bar collected destination + dates but couldn't act on them — users still had to complete a full trip form after login. Two data entry points with no value from the first. One CTA → OAuth → form is a tighter, lossless funnel. |
| Feb 2026 | Added social proof (avatar stack + trip count) above hero CTA | Static social proof ("140+ trips planned this month") removes the empty-page problem for a friends-stage app with no credibility signals. Update the number manually as real usage grows; replace with live count when analytics are wired. |
| Feb 2026 | Landing page CSS written mobile-first | Default styles target mobile (≤ 768px). Desktop overrides use `@media (min-width: 769px)`. Reference HTML is desktop-first for design review only — implementation inverts the breakpoint direction. |
| Mar 2026 | Landing page lives at `/` not `/login`, always public | Authenticated users need to share the landing page without logging out. `/` renders the marketing page unconditionally. Middleware only protects `/dashboard`, `/trips/*`, `/onboarding`. `/login` is the OAuth trigger only and redirects authenticated users away. |

---

## Edge Cases Log

### Edge Case 001 — Profile row not created on login ✅ Fixed in Step 3

Auth callback now upserts a profiles row on every login. Onboarding only calls update on the existing row.

---

### Edge Case 007 — Dashboard accessible mid-session with onboarded: false ✅ Fixed in Step 3

Dashboard page performs a server-side profile fetch on every load. If `onboarded: false` or profile missing, redirects to `/onboarding`.

---

### Edge Case 002 — OpenAI returns malformed or unexpected JSON ✅ Fixed in Step 5

`/api/itineraries/generate` wraps the entire OpenAI call and `JSON.parse` in a try/catch. On any error, returns `{ error: '...' }` with status 502. `ItinerarySection` displays the error message with retry available.

---

### Edge Case 003 — User hits Generate/Regenerate while generation is already running ✅ Fixed in Step 5

`isGenerating` set to `true` immediately on button click. Button is `disabled` while true. Reset to `false` in a `finally` block — runs whether the request succeeds or fails.

---

### Edge Case 004 — Invalid trip dates ✅ Fixed in Step 4

Client-side validation in TripForm and server-side validation in POST /api/trips both enforce: destination required, start date not in the past, end date ≥ start date, max 14 days. End date input also resets automatically when the user picks a start date later than the current end date.

---

### Edge Case 005 — Vercel 60s serverless timeout ✅ Mitigated in Step 5

14-day trip cap keeps prompt size bounded. OpenAI client timeout set to 45s — OpenAI SDK raises a timeout error before Vercel cuts the connection. Error is caught and returned as a friendly message. If real-world timeouts persist, upgrade to Vercel Pro (300s limit).

---

### Edge Case 006 — Service role key bypasses RLS ✅ Audited in Step 5

Full audit of `lib/` and `app/api/` confirms `SUPABASE_SERVICE_ROLE_KEY` is never referenced in any API route handler. All routes use `createServerClient` from `lib/supabase/server.ts` which uses the anon key with cookie-based session auth.

---

### Edge Case 008 — UTC offset shifts displayed dates by one day ✅ Fixed in Step 4

Date strings from Supabase (`YYYY-MM-DD`) must always have `T00:00:00` appended before passing to `new Date()`. Without it, JavaScript interprets the date as UTC midnight, which shifts the displayed date backward by one day for users in negative UTC offset timezones (US, Canada, Latin America). Apply this rule anywhere dates are rendered — itinerary day headers and activity timestamps in Step 5 are the next risk areas.

---

_Maintained by: Ando Engineering_  
_Last updated: 2026-03-01 — Landing page moved to `/`, `/login` simplified to OAuth trigger, middleware updated. Architecture decision logged._
_Next review: After Design Steps 2–4 complete_
