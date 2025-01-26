-- Update existing null values to empty string
UPDATE company_settings
SET canny_api_key = ''
WHERE canny_api_key IS NULL;

-- Alter the column to be NOT NULL with default empty string
ALTER TABLE company_settings
ALTER COLUMN canny_api_key SET DEFAULT '',
ALTER COLUMN canny_api_key SET NOT NULL;

-- Update the type in the generated types
COMMENT ON COLUMN company_settings.canny_api_key IS 'The Canny API key for the company. Empty string if not set.';
