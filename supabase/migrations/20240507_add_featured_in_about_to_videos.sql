-- Add featured_in_about column to videos table
ALTER TABLE videos_despi_9a7b3c4d2e
ADD COLUMN IF NOT EXISTS featured_in_about BOOLEAN DEFAULT FALSE;

-- Ensure only one video can be featured in the About section
CREATE OR REPLACE FUNCTION ensure_single_featured_video()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new or updated row has featured_in_about = true
  IF NEW.featured_in_about = TRUE THEN
    -- Set featured_in_about = false for all other videos
    UPDATE videos_despi_9a7b3c4d2e
    SET featured_in_about = FALSE
    WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists (to avoid errors when re-running)
DROP TRIGGER IF EXISTS ensure_single_featured_video_trigger ON videos_despi_9a7b3c4d2e;

-- Create the trigger
CREATE TRIGGER ensure_single_featured_video_trigger
BEFORE INSERT OR UPDATE ON videos_despi_9a7b3c4d2e
FOR EACH ROW
EXECUTE FUNCTION ensure_single_featured_video();