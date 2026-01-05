-- Add Veteran categories to the enum
ALTER TYPE player_category ADD VALUE 'Veteran Mens Singles';
ALTER TYPE player_category ADD VALUE 'Veteran Womens Singles';
ALTER TYPE player_category ADD VALUE 'Veteran Mens Doubles';
ALTER TYPE player_category ADD VALUE 'Veteran Womens Doubles';
ALTER TYPE player_category ADD VALUE 'Veteran Mixed Doubles';

-- Change category column from single value to array to support multiple categories
ALTER TABLE players 
ALTER COLUMN category DROP NOT NULL;

-- Add a new column for multiple categories
ALTER TABLE players 
ADD COLUMN categories player_category[] DEFAULT '{}';

-- Migrate existing data
UPDATE players 
SET categories = ARRAY[category]
WHERE category IS NOT NULL;

-- Drop the old category column and rename the new one
ALTER TABLE players DROP COLUMN category;
ALTER TABLE players RENAME COLUMN categories TO category;

-- Set NOT NULL constraint
ALTER TABLE players ALTER COLUMN category SET NOT NULL;
ALTER TABLE players ALTER COLUMN category SET DEFAULT '{}';