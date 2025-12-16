-- Diving Competition Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Competitions table (formerly events)
CREATE TABLE IF NOT EXISTS competitions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  num_judges INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (specific events within a competition)
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  competition_id BIGINT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  num_dives INTEGER DEFAULT 6,
  is_running INTEGER DEFAULT 0,
  event_status TEXT DEFAULT 'stopped',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_photo TEXT,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  club TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entries table (competitors' dive entries)
CREATE TABLE IF NOT EXISTS entries (
  id BIGSERIAL PRIMARY KEY,
  competitor_id BIGINT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  dive_number INTEGER NOT NULL,
  fina_code TEXT NOT NULL,
  board_height TEXT NOT NULL,
  difficulty REAL NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dive sheets table (submission status)
CREATE TABLE IF NOT EXISTS dive_sheets (
  id BIGSERIAL PRIMARY KEY,
  competitor_id BIGINT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table (judge scores for each dive entry)
CREATE TABLE IF NOT EXISTS scores (
  id BIGSERIAL PRIMARY KEY,
  entry_id BIGINT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  judge_number INTEGER NOT NULL,
  score REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, judge_number)
);

-- Run orders table (stores the running order for events)
CREATE TABLE IF NOT EXISTS run_orders (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  competitor_id BIGINT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  run_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, competitor_id),
  UNIQUE(event_id, run_position)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_competition_id ON events(competition_id);
CREATE INDEX IF NOT EXISTS idx_competitors_event_id ON competitors(event_id);
CREATE INDEX IF NOT EXISTS idx_entries_competitor_id ON entries(competitor_id);
CREATE INDEX IF NOT EXISTS idx_scores_entry_id ON scores(entry_id);
CREATE INDEX IF NOT EXISTS idx_run_orders_event_id ON run_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(event_status, is_running);

-- Enable Row Level Security (RLS)
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dive_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_orders ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize based on your auth needs)
CREATE POLICY "Allow all operations on competitions" ON competitions FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on competitors" ON competitors FOR ALL USING (true);
CREATE POLICY "Allow all operations on entries" ON entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on dive_sheets" ON dive_sheets FOR ALL USING (true);
CREATE POLICY "Allow all operations on scores" ON scores FOR ALL USING (true);
CREATE POLICY "Allow all operations on run_orders" ON run_orders FOR ALL USING (true);

-- Optional: RPC function for complex SQL queries with JOINs
-- This function is OPTIONAL - the app will work without it using fallback query builder
-- Uncomment and run this if you want to enable complex JOIN queries:

/*
CREATE OR REPLACE FUNCTION execute_sql(sql_query text, sql_params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL execution error: %', SQLERRM;
END;
$$;
*/

-- Note: The execute_sql function above is commented out for security reasons.
-- It allows arbitrary SQL execution which could be a security risk.
-- The app uses a query builder approach that works without this function.
-- Only enable this if you understand the security implications.
