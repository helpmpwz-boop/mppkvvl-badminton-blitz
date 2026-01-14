-- Create a table to store tournament winners/finalists
CREATE TABLE public.tournament_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'winner',
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  awarded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, position)
);

-- Enable Row Level Security
ALTER TABLE public.tournament_winners ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view tournament winners" 
ON public.tournament_winners 
FOR SELECT 
USING (true);

-- Create policies for admin management
CREATE POLICY "Admins can manage tournament winners" 
ON public.tournament_winners 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_winners;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tournament_winners_updated_at
BEFORE UPDATE ON public.tournament_winners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();