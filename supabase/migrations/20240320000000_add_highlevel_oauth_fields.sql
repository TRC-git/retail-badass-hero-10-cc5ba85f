-- Add Highlevel OAuth fields to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_client_id text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_client_secret text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_access_token text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_refresh_token text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_token_expires_at timestamp with time zone;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_location_id text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_company_id text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_oauth_enabled boolean DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_token_type text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS highlevel_scopes text[];

-- Add comment for documentation
COMMENT ON TABLE settings IS 'Stores application settings including Highlevel OAuth credentials'; 