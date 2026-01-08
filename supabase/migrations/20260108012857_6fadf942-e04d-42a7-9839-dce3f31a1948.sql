-- Ensure API roles have the required privileges on the players table
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT INSERT ON TABLE public.players TO anon;
GRANT SELECT ON TABLE public.players TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.players TO authenticated;