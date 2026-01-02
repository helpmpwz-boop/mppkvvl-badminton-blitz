-- Add set-wise scoring columns
ALTER TABLE public.matches
ADD COLUMN set1_score_a integer NOT NULL DEFAULT 0,
ADD COLUMN set1_score_b integer NOT NULL DEFAULT 0,
ADD COLUMN set2_score_a integer NOT NULL DEFAULT 0,
ADD COLUMN set2_score_b integer NOT NULL DEFAULT 0,
ADD COLUMN set3_score_a integer NOT NULL DEFAULT 0,
ADD COLUMN set3_score_b integer NOT NULL DEFAULT 0,
ADD COLUMN sets_won_a integer NOT NULL DEFAULT 0,
ADD COLUMN sets_won_b integer NOT NULL DEFAULT 0,
ADD COLUMN current_set integer NOT NULL DEFAULT 1;

-- Add comment for clarity
COMMENT ON COLUMN public.matches.current_set IS 'Current set being played (1, 2, or 3)';