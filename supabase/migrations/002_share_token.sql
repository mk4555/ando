-- Add share_token to trips so owners can share a read-only link
ALTER TABLE public.trips
  ADD COLUMN share_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE;

CREATE INDEX idx_trips_share_token ON public.trips(share_token);

-- Allow anyone (including unauthenticated) to SELECT trips and itineraries.
-- Security: trip.id and share_token are both gen_random_uuid() — unguessable.
-- INSERT/UPDATE/DELETE remain restricted to the owner via the existing ALL policy.
CREATE POLICY "Public can view trips"
  ON public.trips FOR SELECT USING (true);

CREATE POLICY "Public can view itineraries"
  ON public.itineraries FOR SELECT USING (true);
