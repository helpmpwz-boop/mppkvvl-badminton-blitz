-- Add partner columns for doubles matches
ALTER TABLE public.matches 
ADD COLUMN player_a2_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
ADD COLUMN player_b2_id uuid REFERENCES public.players(id) ON DELETE SET NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.matches.player_a2_id IS 'Doubles partner for player A';
COMMENT ON COLUMN public.matches.player_b2_id IS 'Doubles partner for player B';