-- Fast atomic score updates (avoid read-then-write roundtrip)

CREATE OR REPLACE FUNCTION public.increment_set_score(
  _match_id uuid,
  _set_number int,
  _side text
)
RETURNS public.matches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_row public.matches;
  col_name text;
BEGIN
  IF _set_number NOT IN (1,2,3) THEN
    RAISE EXCEPTION 'Invalid set number: %', _set_number;
  END IF;

  IF upper(_side) NOT IN ('A','B') THEN
    RAISE EXCEPTION 'Invalid side: %', _side;
  END IF;

  col_name := format('set%s_score_%s', _set_number, lower(_side));

  EXECUTE format('UPDATE public.matches SET %I = %I + 1 WHERE id = $1 RETURNING *', col_name, col_name)
  INTO updated_row
  USING _match_id;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'Match not found: %', _match_id;
  END IF;

  RETURN updated_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_current_set_score(
  _match_id uuid,
  _side text
)
RETURNS public.matches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_set int;
BEGIN
  SELECT m.current_set INTO current_set
  FROM public.matches m
  WHERE m.id = _match_id;

  IF current_set IS NULL THEN
    RAISE EXCEPTION 'Match not found: %', _match_id;
  END IF;

  RETURN public.increment_set_score(_match_id, current_set, _side);
END;
$$;
