-- Add explicit trip visibility controls for social/public discovery.
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'private';

ALTER TABLE public.trips
  DROP CONSTRAINT IF EXISTS trips_visibility_check;

ALTER TABLE public.trips
  ADD CONSTRAINT trips_visibility_check
  CHECK (visibility IN ('private', 'unlisted', 'public'));

CREATE INDEX IF NOT EXISTS idx_trips_visibility
  ON public.trips(visibility, created_at DESC);

-- Public can read only published trips.
DROP POLICY IF EXISTS "Public can view published trips" ON public.trips;
CREATE POLICY "Public can view published trips"
  ON public.trips
  FOR SELECT
  USING (visibility = 'public');

-- Public can read only active itineraries tied to published trips.
DROP POLICY IF EXISTS "Public can view published itineraries" ON public.itineraries;
CREATE POLICY "Public can view published itineraries"
  ON public.itineraries
  FOR SELECT
  USING (
    is_active = true
    AND trip_id IN (
      SELECT id
      FROM public.trips
      WHERE visibility = 'public'
    )
  );
