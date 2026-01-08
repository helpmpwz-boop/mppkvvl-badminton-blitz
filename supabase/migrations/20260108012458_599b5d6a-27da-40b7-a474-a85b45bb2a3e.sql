-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can register as a player" ON public.players;

-- Create a new PERMISSIVE INSERT policy for public registration
CREATE POLICY "Anyone can register as a player"
ON public.players
FOR INSERT
TO public
WITH CHECK (true);