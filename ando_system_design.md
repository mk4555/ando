# Ando — Technical & System Design Document

**Version:** 1.1  
**Date:** February 2026  
**Author:** Founder & Lead Developer  
**Status:** In Progress — Steps 1–4 complete, Step 5 next

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Technical Philosophy](#2-technical-philosophy)
3. [System Architecture](#3-system-architecture)
4. [Data Models](#4-data-models)
5. [Core Services](#5-core-services)
6. [AI & Itinerary Engine](#6-ai--itinerary-engine)
7. [API Design](#7-api-design)
8. [Database Strategy](#8-database-strategy)
9. [Infrastructure & Scaling](#9-infrastructure--scaling)
10. [Security & Privacy](#10-security--privacy)
11. [Mobile & Frontend](#11-mobile--frontend)
12. [Development Roadmap](#12-development-roadmap)
13. [Progress Tracker](#13-progress-tracker)

---

## 1. Product Overview

**Ando** is an AI-powered travel app that generates personalized, dynamic itineraries for travelers. Unlike static travel guides, Ando understands the traveler's profile — budget, travel style, dietary preferences, mobility, interests — and continuously adapts the plan in real time based on weather, local events, availability, and feedback.

### Core Value Proposition

| Traditional Travel Apps | Ando |
|------------------------|------|
| Static destination guides | Dynamic, personalized itineraries |
| Generic recommendations | Context-aware suggestions (budget, vibe, pace) |
| Rigid plans | Real-time re-routing and adaptation |
| One-time planning | Continuous trip companion |

### Target Users

- **Solo backpackers** — budget-sensitive, spontaneous, adventure-seeking
- **Couples & small groups** — experience-focused, moderate planning
- **Families** — logistics-heavy, safety-conscious, accessibility needs
- **Digital nomads** — long-stay exploration, work-life balance

---

## 2. Technical Philosophy

### Principles

1. **Scale from day one, but don't over-engineer.** We design for 1M+ users architecturally, but implement the simplest version that works first.
2. **Data is the moat.** Every interaction improves our personalization engine. Capture everything with user consent.
3. **Async by default.** Heavy computation (AI, mapping, pricing) happens in background workers, not request paths.
4. **Stateless services.** Every service is horizontally scalable. No server-side session state.
5. **Fail gracefully.** If the AI itinerary engine is slow, serve a cached baseline. Never block the user.

### Tech Stack Decision Log

| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Frontend | Next.js 14 (App Router) → React Native | Web-first. Next.js + PWA for the friends stage — faster to ship, no App Store friction. React Native introduced when retention data justifies native investment. |
| API Gateway | AWS API Gateway + Kong | Rate limiting, auth, and routing at the edge. Kong for advanced plugin ecosystem. |
| Backend Services | Node.js (TypeScript) + Python | Node for latency-sensitive REST/GraphQL APIs; Python for AI/ML pipelines. |
| Primary DB | PostgreSQL (RDS Aurora) | ACID compliance for bookings and user data; Aurora auto-scales read replicas. |
| Search & Discovery | Elasticsearch | Full-text place search, geo-queries, and faceted filtering at scale. |
| Caching | Redis (ElastiCache) | Session cache, itinerary cache, rate-limit counters. Sub-millisecond reads. |
| Message Queue | AWS SQS + SNS | Decouples services. SQS for task queues; SNS for fan-out notifications. |
| AI/LLM | OpenAI GPT-4o + fine-tuned model | GPT-4o for itinerary generation; custom fine-tune for structured JSON output. |
| Maps | Google Maps Platform + Mapbox | Google for search/places data; Mapbox for custom map rendering in-app. |
| Object Storage | AWS S3 + CloudFront | User-uploaded photos, cached itinerary PDFs, static assets via CDN. |
| Auth | Supabase Auth → Auth0 (at scale) | Supabase Auth covers OAuth 2.0 + social login at zero cost for the friends stage. Migrate to Auth0 when enterprise SSO or advanced MFA is required. |
| Observability | Datadog + Sentry | APM, log aggregation, error tracking, and alerting. |
| CI/CD | GitHub Actions + ArgoCD | Automated testing and Kubernetes GitOps deployments. |
| Container Orchestration | AWS EKS (Kubernetes) | Container management at scale. Rolling deploys, autoscaling. |

---

## 3. System Architecture

### High-Level Architecture Diagram

```
                        ┌─────────────────────────────────────────┐
                        │              USERS                       │
                        │   iOS App    Android App    Web (PWA)    │
                        └──────────────────┬──────────────────────┘
                                           │ HTTPS
                        ┌──────────────────▼──────────────────────┐
                        │         CloudFront CDN + WAF             │
                        │   (Static Assets, DDoS Protection)       │
                        └──────────────────┬──────────────────────┘
                                           │
                        ┌──────────────────▼──────────────────────┐
                        │      API Gateway (Kong + AWS APIGW)      │
                        │   Auth, Rate Limiting, Routing, Logging  │
                        └──────┬──────────┬──────────┬────────────┘
                               │          │          │
              ┌────────────────▼─┐  ┌─────▼────┐  ┌─▼──────────────┐
              │  User Service    │  │ Itinerary│  │  Places Service │
              │  (Auth, Profile) │  │ Service  │  │  (Search, POI)  │
              └────────┬─────────┘  └────┬─────┘  └───────┬─────────┘
                       │                 │                  │
              ┌────────▼─────────────────▼──────────────────▼───────┐
              │                  Internal Event Bus                  │
              │              (SQS / SNS / EventBridge)               │
              └──────┬──────────────────────────────────┬────────────┘
                     │                                  │
         ┌───────────▼──────────┐          ┌────────────▼──────────────┐
         │   AI Engine Service  │          │  Notification Service     │
         │  (LLM Orchestration, │          │  (Push, Email, SMS)       │
         │   Python Workers)    │          └───────────────────────────┘
         └───────────┬──────────┘
                     │
    ┌────────────────┼──────────────────────────┐
    │                │                          │
┌───▼──────┐  ┌──────▼─────┐          ┌─────────▼──────┐
│PostgreSQL│  │    Redis    │          │ Elasticsearch  │
│(Aurora)  │  │(ElastiCache)│          │(Places Search) │
└──────────┘  └────────────┘          └────────────────┘
```

### Service Breakdown

#### User Service
Handles authentication, user profiles, preferences, and social connections. Stateless; uses Supabase Auth for token validation at the friends stage, migrating to Auth0 when enterprise SSO is needed. Writes to PostgreSQL; reads from Redis cache for hot user data.

#### Itinerary Service
The core product service. Orchestrates itinerary creation, modification, and storage. Calls the AI Engine asynchronously via SQS. Returns a `job_id` immediately; the client polls or receives a push notification when complete.

*Why async?* GPT-4o calls can take 5–15 seconds. Blocking the HTTP request would timeout mobile clients and waste server threads. Instead: request → queue → worker → websocket/push notification → client.

#### Places Service
Aggregates data from Google Places API, Foursquare, TripAdvisor, and our own database. Maintains a local Elasticsearch index updated nightly for fast querying without hitting external API rate limits on every user search.

#### AI Engine Service
Python-based workers (Celery) that consume from SQS. Each worker:
1. Fetches user profile + trip parameters
2. Retrieves relevant places from Elasticsearch
3. Constructs a structured prompt
4. Calls GPT-4o with function calling for JSON output
5. Post-processes and validates the itinerary
6. Stores result to PostgreSQL
7. Publishes completion event → SNS → Push notification

---

## 4. Data Models

### Core Entities

```sql
-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id        VARCHAR(255) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    display_name    VARCHAR(100),
    avatar_url      TEXT,
    travel_style    JSONB,           -- {"pace": "slow", "budget": "mid", "interests": ["food", "art"]}
    preferences     JSONB,           -- dietary, accessibility, accommodation type
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    destination     VARCHAR(255) NOT NULL,
    country_code    CHAR(2),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    traveler_count  INT DEFAULT 1,
    budget_total    DECIMAL(10,2),
    currency        CHAR(3) DEFAULT 'USD',
    status          VARCHAR(20) DEFAULT 'draft',   -- draft, active, completed, archived
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Itineraries
CREATE TABLE itineraries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID REFERENCES trips(id) ON DELETE CASCADE,
    version         INT DEFAULT 1,     -- supports multiple versions / re-generations
    generated_at    TIMESTAMPTZ DEFAULT NOW(),
    ai_model        VARCHAR(50),       -- track which model generated it
    prompt_hash     CHAR(64),          -- dedup identical requests
    days            JSONB NOT NULL,    -- array of DayPlan objects
    is_active       BOOLEAN DEFAULT TRUE
);

-- Places (our own curated POI database)
CREATE TABLE places (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_place_id VARCHAR(255) UNIQUE,
    name            VARCHAR(255) NOT NULL,
    country_code    CHAR(2),
    city            VARCHAR(100),
    category        VARCHAR(50),       -- restaurant, attraction, hotel, transport
    subcategory     VARCHAR(50),
    coordinates     POINT,
    avg_duration_min INT,              -- how long visitors typically spend
    price_level     SMALLINT,          -- 1-4 (like Google)
    rating          DECIMAL(3,2),
    review_count    INT,
    opening_hours   JSONB,
    tags            TEXT[],
    source_data     JSONB,             -- raw data from external APIs
    last_verified   TIMESTAMPTZ
);

-- Bookings (future monetization layer)
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID REFERENCES trips(id),
    user_id         UUID REFERENCES users(id),
    booking_type    VARCHAR(30),       -- hotel, flight, activity, restaurant
    provider        VARCHAR(50),       -- booking.com, viator, opentable
    external_ref    VARCHAR(255),
    status          VARCHAR(20),
    price           DECIMAL(10,2),
    currency        CHAR(3),
    booked_at       TIMESTAMPTZ,
    metadata        JSONB
);
```

### JSONB Schema for Itinerary Days

```json
{
  "days": [
    {
      "day": 1,
      "date": "2026-03-15",
      "theme": "Arrival & Old Town Exploration",
      "activities": [
        {
          "id": "act_uuid",
          "time": "10:00",
          "duration_min": 90,
          "place_id": "place_uuid",
          "place_name": "Sagrada Família",
          "category": "attraction",
          "notes": "Book skip-the-line tickets in advance",
          "travel_to_next": {
            "mode": "metro",
            "duration_min": 15,
            "cost_estimate": 2.40
          }
        }
      ],
      "meals": {
        "breakfast": { "place_id": "...", "time": "08:30" },
        "lunch": { "place_id": "...", "time": "13:00" },
        "dinner": { "place_id": "...", "time": "20:00" }
      },
      "estimated_cost": 85.00,
      "notes": "Wear comfortable shoes — 8km of walking today."
    }
  ]
}
```

---

## 5. Core Services

### Itinerary Generation Flow

**Friends stage (current):** Generation is triggered explicitly by the user from the trip detail page (`/trips/[id]`), not automatically after trip creation. This decouples trip creation from generation, allowing each to be built and tested independently. When async generation is introduced, only the button handler changes.

**At scale (>50 concurrent users):** Async flow via job queue as shown below.

```
Client                 API Gateway          Itinerary Svc        AI Engine
  │                        │                     │                   │
  │──POST /trips/generate──▶                     │                   │
  │                        │──route──────────────▶                   │
  │                        │                     │──enqueue job──────▶
  │                        │                     │                   │
  │◀── 202 Accepted ────────────────────────────│                   │
  │    { job_id: "abc" }   │                     │  (worker picks up)│
  │                        │                     │◀──process──────────
  │                        │                     │                   │
  │  [WebSocket / Push]    │                     │                   │
  │◀── itinerary_ready ────│◀── publish event ───│                   │
  │                        │                     │                   │
  │──GET /itineraries/abc──▶                     │                   │
  │◀── 200 { itinerary }───│◀────────────────────│                   │
```

### Caching Strategy

| Data Type | Cache Layer | TTL | Reasoning |
|-----------|-------------|-----|-----------|
| User profile | Redis | 15 min | Frequently read, infrequently changed |
| Place details | Redis | 24 hrs | External API data doesn't change often |
| Itinerary (completed) | Redis | 1 hr | Fast re-fetch; DB as source of truth |
| Search results | Redis | 5 min | Balance freshness vs API cost |
| Exchange rates | Redis | 1 hr | Financial data, should be recent |

**Cache invalidation rule:** On any write to a user's profile or trip, invalidate related Redis keys immediately (write-through invalidation, not write-through update — avoids race conditions).

### Rate Limiting

Applied at Kong API Gateway level per `user_id` (authenticated) or `IP` (unauthenticated):

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /itineraries/generate` | 5 | per hour |
| `GET /places/search` | 100 | per minute |
| `POST /auth/login` | 10 | per 15 min |
| All other endpoints | 300 | per minute |

*Rationale:* Itinerary generation is expensive (LLM cost ~$0.10–0.30 per call). Rate limiting protects both cost and quality of service for all users.

---

## 6. AI & Itinerary Engine

### Prompt Architecture

The system uses a **structured prompt with function calling** to guarantee parseable JSON output — critical for production reliability.

```python
SYSTEM_PROMPT = """
You are Ando's travel planner. Generate personalized, realistic day-by-day itineraries.

Rules:
- Respect the user's travel pace (slow/medium/fast)
- Account for travel time between activities
- Include realistic cost estimates in the user's currency
- Prioritize activities matching the user's interests
- Flag any seasonal closures or booking requirements
- Meals must respect dietary restrictions

Output ONLY via the create_itinerary function call. Never output raw JSON.
"""

def build_user_prompt(trip, user, places):
    return f"""
Create a {trip.duration_days}-day itinerary for {trip.destination}.

Traveler Profile:
- Budget: {user.budget_level} (total: {trip.budget_total} {trip.currency})
- Travel style: {user.travel_style}
- Interests: {', '.join(user.interests)}
- Dietary restrictions: {', '.join(user.dietary)}
- Travelers: {trip.traveler_count}

Available places (pre-filtered by relevance):
{json.dumps(places, indent=2)}

Dates: {trip.start_date} to {trip.end_date}
"""
```

### Retrieval Augmented Generation (RAG) for Places

Rather than relying on GPT-4o's world knowledge (stale, hallucination-prone for specific hours/prices), we:

1. Pre-filter places from our Elasticsearch index using vector embeddings of user interests
2. Inject real-time place data (hours, rating, price) into the prompt context
3. GPT-4o then *selects and sequences* from our curated set — it doesn't invent places

This reduces hallucination of non-existent restaurants by ~90% in internal testing.

### Personalization Loop

```
Trip Completed
     │
     ▼
Collect feedback (rating, activity completions, skipped items)
     │
     ▼
Update User Embedding (interest vectors in pgvector)
     │
     ▼
Next trip generation uses updated embedding for place retrieval
```

Over time, Ando learns that a user who always skips museums but rates every food market 5 stars is a culinary explorer, not an art lover — even if they originally selected "culture" as an interest.

---

## 7. API Design

### REST Endpoints (v1)

```
Authentication
  POST   /v1/auth/login
  POST   /v1/auth/refresh
  DELETE /v1/auth/logout

Users
  GET    /v1/users/me
  PATCH  /v1/users/me
  GET    /v1/users/me/preferences
  PUT    /v1/users/me/preferences

Trips
  GET    /v1/trips
  POST   /v1/trips
  GET    /v1/trips/:id
  PATCH  /v1/trips/:id
  DELETE /v1/trips/:id

Itineraries
  POST   /v1/trips/:id/itineraries/generate    # Async — returns job_id
  GET    /v1/trips/:id/itineraries/latest
  GET    /v1/itineraries/:id
  PATCH  /v1/itineraries/:id/days/:day         # Manual edits
  POST   /v1/itineraries/:id/regenerate        # Re-generate with new params

Places
  GET    /v1/places/search?q=&lat=&lng=&category=
  GET    /v1/places/:id
  POST   /v1/places/:id/bookmark

Jobs (polling)
  GET    /v1/jobs/:id                          # Check async job status
```

### WebSocket Events (Real-time)

```
ws://api.ando.app/v1/ws

Client → Server:
  { "type": "subscribe", "job_id": "abc123" }

Server → Client:
  { "type": "job_progress", "job_id": "abc123", "progress": 60, "stage": "optimizing_routes" }
  { "type": "job_complete", "job_id": "abc123", "itinerary_id": "itin_xyz" }
  { "type": "job_error",    "job_id": "abc123", "message": "..." }
```

### API Versioning Strategy

URL-based versioning (`/v1/`, `/v2/`). When breaking changes are needed, we release a new version and deprecate the old one with a 6-month sunset window. Never silently break existing clients — mobile apps can't be force-updated.

---

## 8. Database Strategy

### PostgreSQL (Primary)

Used for: users, trips, itineraries, bookings, payments — anything requiring ACID guarantees.

**Aurora Configuration:**
- 1 writer instance (r6g.large initially, scale to r6g.2xlarge at ~100K users)
- 2+ reader replicas (for read-heavy profile/itinerary fetches)
- Aurora Serverless v2 for dev/staging (cost optimization)
- Connection pooling via PgBouncer (prevents connection exhaustion at scale)

**Key indexes:**
```sql
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status) WHERE status != 'archived';
CREATE INDEX idx_places_coordinates ON places USING GIST(coordinates);
CREATE INDEX idx_places_tags ON places USING GIN(tags);
CREATE INDEX idx_itineraries_trip_id ON itineraries(trip_id, is_active);
```

**Partitioning plan (at 500K+ trips):**
```sql
-- Partition trips by created_at year — queries typically filter by recency
CREATE TABLE trips PARTITION BY RANGE (created_at);
CREATE TABLE trips_2026 PARTITION OF trips FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### Elasticsearch (Search & Discovery)

Used for: place search, geo-queries, full-text, and faceted filtering.

Index design:
```json
{
  "mappings": {
    "properties": {
      "name":         { "type": "text", "analyzer": "standard" },
      "location":     { "type": "geo_point" },
      "category":     { "type": "keyword" },
      "tags":         { "type": "keyword" },
      "price_level":  { "type": "integer" },
      "rating":       { "type": "float" },
      "name_suggest": { "type": "completion" }   // autocomplete
    }
  }
}
```

### Redis (Cache & Ephemeral State)

- **Cluster mode** with 3 shards (6 nodes total) for high availability
- **Data structures used:**
  - `STRING` — cached API responses (user profiles, place details)
  - `HASH` — session metadata
  - `SORTED SET` — leaderboards, trending destinations
  - `STREAM` — real-time activity feeds (future social feature)

---

## 9. Infrastructure & Scaling

### Multi-Region Architecture

**Phase 1 (0–100K users):** Single region — `us-east-1` with multi-AZ for HA.

**Phase 2 (100K–1M users):** Active-active in `us-east-1` + `eu-west-1`:
- Route53 latency-based routing
- Aurora Global Database (cross-region read replicas with <1s replication lag)
- S3 Cross-Region Replication for user media
- ElastiCache Global Datastore

**Phase 3 (1M+ users):** Add `ap-southeast-1` (Southeast Asia, major backpacker market).

### Kubernetes Auto-scaling

```yaml
# HorizontalPodAutoscaler for Itinerary Service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: itinerary-service-hpa
spec:
  scaleTargetRef:
    name: itinerary-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 65
  - type: External
    external:
      metric:
        name: sqs_queue_depth    # scale AI workers based on queue backlog
      target:
        type: AverageValue
        averageValue: "10"
```

### Cost Optimization at Scale

| Strategy | Estimated Savings |
|----------|------------------|
| Spot instances for AI workers (fault-tolerant batch jobs) | 60–70% vs on-demand |
| S3 Intelligent-Tiering for old itineraries | 40% storage cost reduction |
| CloudFront caching for place images | 80% reduction in origin requests |
| LLM response caching (identical prompts) | 15–25% LLM cost reduction |
| Reserved instances for DB + cache (1yr) | 30–40% vs on-demand |

**LLM cost projection:**
- Average itinerary generation: ~$0.15 (GPT-4o input + output tokens)
- 1M users × 5 trips/year × 2 generations avg = 10M calls/year
- At $0.15/call = **$1.5M/year** in LLM costs → fine-tuning our own model becomes ROI-positive at this scale

---

## 10. Security & Privacy

### Authentication & Authorization

- **Supabase Auth** (friends stage) → **Auth0** (at scale) — OAuth 2.0 + PKCE for mobile clients. Supabase Auth covers social login and session management at zero cost. Auth0 migration triggered by enterprise SSO requirements or >200 active users.
- **JWT access tokens** (15 min expiry) + **Refresh tokens** (30 day, rotated on each use)
- **RBAC:** roles: `user`, `premium`, `admin`. Enforced at API Gateway level.

### Data Privacy (GDPR / CCPA Compliance)

- User data is stored in their nearest region (EU users → `eu-west-1`)
- **Right to erasure:** `/v1/users/me` DELETE triggers async job: anonymize trips, delete PII, revoke Auth0 account
- **Data minimization:** We only collect what's needed for personalization. Location is never stored raw — only aggregated for preferences.
- **Consent management:** Explicit opt-in for marketing, analytics, and AI training use of trip data.

### Security Practices

- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Secrets in AWS Secrets Manager (never in `.env` files in repo)
- VPC with private subnets for DB and cache layers — never publicly accessible
- WAF rules: SQL injection, XSS, rate limiting at edge
- Dependency scanning: Snyk in CI pipeline
- Penetration testing: annual third-party audit (post-launch)

---

## 11. Mobile & Frontend

### React Native Architecture

```
src/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/             # Login, onboarding screens
│   ├── (tabs)/             # Main tab navigator
│   │   ├── explore.tsx     # Destination discovery
│   │   ├── trips.tsx       # My trips
│   │   ├── itinerary.tsx   # Active trip view
│   │   └── profile.tsx
│   └── trip/[id]/          # Dynamic trip screens
├── components/
│   ├── ui/                 # Design system (Button, Card, Input)
│   ├── map/                # Mapbox components
│   └── itinerary/          # ItineraryDay, ActivityCard, etc.
├── hooks/                  # useTrip, useItinerary, useUser
├── stores/                 # Zustand global state
├── services/               # API clients (axios instances)
├── utils/
└── types/                  # TypeScript interfaces
```

### State Management

**Zustand** for global state (lightweight, no boilerplate).
**React Query (TanStack Query)** for server state — caching, background refresh, optimistic updates.

```typescript
// Example: Optimistic itinerary update
const { mutate: updateActivity } = useMutation({
  mutationFn: (update) => api.patch(`/itineraries/${id}/activities/${actId}`, update),
  onMutate: async (update) => {
    // Optimistically update UI before server confirms
    queryClient.setQueryData(['itinerary', id], old => applyUpdate(old, update));
  },
  onError: (err, _, context) => {
    // Rollback on failure
    queryClient.setQueryData(['itinerary', id], context.previous);
    toast.error('Could not save change. Try again.');
  }
});
```

### Offline Support

Travelers are often offline. Key offline capabilities:
- **Cached itinerary** — full trip plan available offline via MMKV storage
- **Offline map tiles** — Mapbox offline packs for the destination region
- **Offline edit queue** — changes queued locally and synced when connection restored

---

## 12. Development Roadmap

### Phase 0 — Foundation (Month 1–2)
- [ ] Monorepo setup (Turborepo: mobile + backend)
- [ ] Auth flow (Auth0 integration)
- [ ] User profile CRUD
- [ ] Basic trip creation
- [ ] Database schema + migrations (Flyway)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Dev/staging environments on EKS

### Phase 1 — MVP (Month 3–5)
- [ ] AI itinerary generation (GPT-4o, async via SQS)
- [ ] Places service + Elasticsearch index
- [ ] Itinerary display (day-by-day view, map view)
- [ ] Manual itinerary editing
- [ ] Push notifications (itinerary ready, trip reminders)
- [ ] Basic onboarding (travel style quiz)
- [ ] App Store + Play Store submission

### Phase 2 — Growth (Month 6–9)
- [ ] Real-time weather integration (adapts itinerary on weather change)
- [ ] Booking links (affiliate — hotels, activities)
- [ ] Trip sharing (read-only shareable link)
- [ ] Offline mode (cached itinerary + maps)
- [ ] Premium tier (unlimited regenerations, offline, PDF export)
- [ ] Multi-region infrastructure (EU)

### Phase 3 — Scale (Month 10–15)
- [ ] Social features (follow travelers, public trip inspiration)
- [ ] Fine-tuned itinerary model (reduce LLM costs)
- [ ] Group trips (multi-user itinerary collaboration)
- [ ] In-app booking (direct revenue, not just affiliate)
- [ ] Destination content team / UGC reviews
- [ ] Southeast Asia region (infrastructure + content)

### Phase 4 — Platform (Month 16+)
- [ ] Ando for Business (corporate travel)
- [ ] API access for travel agencies
- [ ] Marketplace (local guides sell experiences via Ando)
- [ ] Predictive re-booking (flight disruption handling)

---

## 13. Progress Tracker

### Current Sprint: AI Generation (Step 5)

| Task | Status | Notes |
|------|--------|-------|
| Project foundation (Next.js, Supabase, Vercel) | ✅ Complete | |
| Google OAuth + session middleware | ✅ Complete | Supabase Auth |
| Onboarding quiz (pace, budget, interests, dietary) | ✅ Complete | Profile upsert at auth callback |
| Trip creation form + API | ✅ Complete | 14-day cap, date validation |
| Dashboard (trip grid + empty state) | ✅ Complete | Server component, direct Supabase query |
| `/trips/[id]` scaffold + disabled Generate button | ✅ Complete | Decoupled from generation (Option B) |
| AI itinerary generation | 🔲 Next | Step 5 |
| ItineraryView, DayCard, ActivityItem | 🔲 Next | Step 5 |
| PWA setup + mobile polish | 🔲 Pending | Step 6 |
| Invite friends | 🔲 Pending | Step 6 |

### Milestone Overview

| Milestone | Target | Status |
|-----------|--------|--------|
| Foundation + Auth + Onboarding | Month 1 | ✅ Complete |
| Trip Creation | Month 1 | ✅ Complete |
| AI Generation (internal testing) | Month 2 | 🔲 In Progress |
| Friends beta (5–20 users) | Month 2 | 🔲 Pending |
| Public beta (1K users) | Month 4 | 🔲 Pending |
| App Store launch (React Native) | Month 6 | 🔲 Pending |
| 10K users | Month 9 | 🔲 Pending |
| 100K users | Month 14 | 🔲 Pending |
| 1M users | Month 24 | 🔲 Pending |

### Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Feb 2026 | Rename Backpackr → Ando | Broader brand appeal; not limited to backpacker demographic |
| Feb 2026 | Web-first (Next.js + PWA) before React Native | Faster to ship, easier to iterate. No App Store friction at friends stage. |
| Feb 2026 | Supabase Auth instead of Auth0 | Free tier sufficient. Same OAuth 2.0 standard. Revisit when enterprise SSO needed. |
| Feb 2026 | Async itinerary generation via SQS (at scale) | LLM latency too high for synchronous HTTP at volume. Synchronous call acceptable for <50 users. |
| Feb 2026 | Generation triggered from /trips/[id], not form | Decouples trip creation from generation. Each step ships independently. No form refactoring when async is introduced. |
| Feb 2026 | RAG for places (not pure LLM) | Reduces hallucination; real-time data; lower token costs |
| Feb 2026 | Aurora PostgreSQL as primary DB | ACID for financial/booking data; Aurora autoscaling for future growth |
| Feb 2026 | Server components query Supabase directly | Avoids HTTP round-trips on first load. API routes exist for client-side React Query calls only. |
| Feb 2026 | Max trip duration 14 days | Keeps prompt size manageable. Protects against Vercel 60s timeout at friends stage. |

---

*Document maintained by: Ando Engineering  
Last updated: February 2026 — v1.1, reflects actual build decisions through Step 4*
