-- Lock down broad public read access and replace it with a token-scoped RPC.

-- Remove globally public SELECT access introduced in 002_share_token.sql.
DROP POLICY IF EXISTS "Public can view trips" ON public.trips;
DROP POLICY IF EXISTS "Public can view itineraries" ON public.itineraries;

-- Public shared access is now exposed only through this function.
-- SECURITY DEFINER allows execution without requiring broad table policies.
CREATE OR REPLACE FUNCTION public.get_shared_trip(p_share_token UUID)
RETURNS TABLE (
  trip_id UUID,
  destination VARCHAR(255),
  title VARCHAR(255),
  start_date DATE,
  end_date DATE,
  traveler_count INT,
  budget_total NUMERIC(10, 2),
  currency CHAR(3),
  itinerary JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.destination,
    t.title,
    t.start_date,
    t.end_date,
    t.traveler_count,
    t.budget_total,
    t.currency,
    (
      SELECT jsonb_build_object(
        'id', i.id,
        'trip_id', i.trip_id,
        'version', i.version,
        'generated_at', i.generated_at,
        'ai_model', i.ai_model,
        'prompt_hash', i.prompt_hash,
        'days', i.days,
        'is_active', i.is_active
      )
      FROM public.itineraries i
      WHERE i.trip_id = t.id
        AND i.is_active = true
      ORDER BY i.generated_at DESC
      LIMIT 1
    ) AS itinerary
  FROM public.trips t
  WHERE t.share_token = p_share_token
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_shared_trip(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_trip(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_shared_trip(UUID) TO authenticated;
