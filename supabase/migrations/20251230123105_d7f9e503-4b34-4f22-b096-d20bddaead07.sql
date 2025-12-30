-- Drop and recreate the insert policy for players to fix the issue
DROP POLICY IF EXISTS "Anyone can register as a player" ON public.players;

-- Create a proper insert policy that allows anyone to insert
CREATE POLICY "Anyone can register as a player"
ON public.players
FOR INSERT
TO public
WITH CHECK (true);