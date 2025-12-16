# Quick Start with Supabase

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new project (choose a name, password, and region)
4. Wait ~2 minutes for setup to complete

## Step 2: Set Up Database
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase-schema.sql` from this project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **RUN** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

## Step 3: Get Your API Keys
1. Click **Settings** (gear icon in left sidebar)
2. Click **API** in settings menu
3. Copy these two values:
   - **URL** (Project URL)
   - **anon/public** key (under Project API keys)

## Step 4: Configure Your App
1. In the project folder, copy `.env.example` to `.env`
2. Edit `.env` and paste your credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-long-anon-key-here
```

## Step 5: Run the App
```bash
npm install
npm start
```

Open http://localhost:3000 in your browser!

## Troubleshooting

**Error: "SUPABASE_URL and SUPABASE_ANON_KEY must be set"**
- Make sure `.env` file exists in project root
- Check that you copied the keys correctly (no extra spaces)

**Error: "Table does not exist"**
- Go back to Supabase SQL Editor
- Make sure you ran the ENTIRE `supabase-schema.sql` file
- Check **Table Editor** to verify tables were created

**Error: "Cannot execute complex SQL query"**
- This is normal for some queries
- The app will try to work around it
- For best results, create the `execute_sql` function (see SUPABASE-MIGRATION.md)

## Need More Help?
See the detailed guide in [SUPABASE-MIGRATION.md](./SUPABASE-MIGRATION.md)
