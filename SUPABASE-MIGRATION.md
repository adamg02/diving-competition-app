# Supabase Migration Guide

This application has been migrated from SQLite to Supabase (PostgreSQL).

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

### 2. Set Up Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Open the `supabase-schema.sql` file from this repository
3. Copy all the SQL code and paste it into the SQL Editor
4. Click **Run** to create all tables and indexes

### 3. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env` file in the project root (copy from `.env.example`):

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create RPC Function for Complex Queries (Optional but Recommended)

For complex SQL queries with JOINs, create this RPC function in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION execute_sql(sql_query text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE sql_query INTO result USING params;
  RETURN result;
END;
$$;
```

**Note:** This function is optional. The app will work without it, but some complex queries might fail.

### 5. Install Dependencies and Run

```bash
npm install
npm start
```

## Migrating Existing Data

If you have existing SQLite data you want to migrate:

### Option 1: Manual Export/Import

1. **Export from SQLite:**
```bash
sqlite3 diving_competition.db .dump > data-export.sql
```

2. **Convert to PostgreSQL format:**
   - Replace `INTEGER PRIMARY KEY AUTOINCREMENT` with `BIGSERIAL PRIMARY KEY`
   - Replace `DATETIME DEFAULT CURRENT_TIMESTAMP` with `TIMESTAMPTZ DEFAULT NOW()`
   - Remove SQLite-specific syntax

3. **Import to Supabase:**
   - Run the converted SQL in Supabase SQL Editor

### Option 2: Use a Migration Tool

Use tools like [pgloader](https://pgloader.io/) to automatically convert and migrate:

```bash
pgloader sqlite://diving_competition.db postgresql://[supabase-connection-string]
```

## Key Differences

### Data Types
- SQLite `INTEGER` → PostgreSQL `BIGINT`
- SQLite `REAL` → PostgreSQL `REAL` or `DOUBLE PRECISION`
- SQLite `TEXT` → PostgreSQL `TEXT`

### Auto-Increment
- SQLite: `INTEGER PRIMARY KEY AUTOINCREMENT`
- PostgreSQL: `BIGSERIAL PRIMARY KEY`

### Timestamps
- SQLite: `DATETIME DEFAULT CURRENT_TIMESTAMP`
- PostgreSQL: `TIMESTAMPTZ DEFAULT NOW()`

### Case Sensitivity
- PostgreSQL is more strict about case sensitivity in column names and SQL keywords

## Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_ANON_KEY must be set"
- Make sure you've created a `.env` file with your Supabase credentials
- Check that the `.env` file is in the project root directory

### Error: "Cannot execute complex SQL query"
- Some queries with JOINs require the `execute_sql` RPC function
- Create the RPC function in Supabase SQL Editor (see step 4 above)
- Alternatively, the app will try to handle simple queries without RPC

### Error: "Table does not exist"
- Make sure you've run the `supabase-schema.sql` file in your Supabase SQL Editor
- Check the table names in Supabase dashboard under **Table Editor**

### Connection Issues
- Verify your Supabase URL and API key are correct
- Check that your Supabase project is active (not paused)
- Ensure Row Level Security policies are set correctly (see schema file)

## Benefits of Supabase

1. **Real-time subscriptions** - Can add live updates to competition results
2. **Built-in authentication** - Easy OAuth integration
3. **Scalability** - PostgreSQL can handle much larger datasets
4. **Cloud-hosted** - No local database file to manage
5. **Automatic backups** - Supabase handles backups automatically
6. **Better performance** - PostgreSQL is optimized for concurrent users

## Reverting to SQLite

If you need to revert to SQLite:

1. Restore the backup:
```bash
Copy-Item database-sqlite.js.backup database.js
```

2. Reinstall SQLite dependency:
```bash
npm install sqlite3
```

3. Remove Supabase dependency (optional):
```bash
npm uninstall @supabase/supabase-js
```
