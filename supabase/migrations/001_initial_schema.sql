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
