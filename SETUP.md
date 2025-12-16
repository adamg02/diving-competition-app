# 🎯 Complete Setup Guide

## You're almost ready! Follow these steps:

### 📋 Prerequisites
- Node.js installed (v14+)
- A Supabase account (free at supabase.com)

---

## 🚀 Quick Setup (5 minutes)

### 1️⃣ Set Up Supabase Database

#### Create Project
1. Go to https://supabase.com
2. Sign in or create account
3. Click "New project"
4. Fill in:
   - **Name**: diving-competition-app
   - **Password**: (create a secure password - save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. ⏰ Wait 2 minutes for provisioning

#### Create Tables
1. Click **SQL Editor** in left sidebar
2. Click **New query**
3. Open `supabase-schema.sql` from this project folder
4. Copy ALL the content (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor (Ctrl+V)
6. Click **RUN** button (or Ctrl+Enter)
7. ✅ You should see "Success. No rows returned"

### 2️⃣ Get API Credentials

1. Click **Settings** ⚙️ in left sidebar
2. Click **API**
3. Find and copy these two values:

   📝 **Project URL** (looks like: `https://abc123xyz.supabase.co`)
   
   📝 **anon public** key (long string under "Project API keys")

### 3️⃣ Configure Your App

1. In this project folder, find `.env.example`
2. Make a copy and rename it to `.env`
3. Open `.env` in a text editor
4. Replace the placeholder values:

```env
SUPABASE_URL=https://abc123xyz.supabase.co
SUPABASE_ANON_KEY=your-very-long-key-here
```

5. Save the file

### 4️⃣ Install & Run

Open terminal/command prompt in project folder:

```bash
npm install
npm start
```

✅ Open http://localhost:3000

---

## ✅ Verification

Test these features:
1. Create a competition
2. Add an event
3. Add competitors
4. Create dive sheets
5. Generate run order
6. Judge scoring

If everything works, you're all set! 🎉

---

## ❓ Troubleshooting

### "SUPABASE_URL and SUPABASE_ANON_KEY must be set"
- **Fix**: Make sure `.env` file exists (not `.env.example`)
- Check file is in project root (same folder as `server.js`)
- Verify no extra spaces in the values

### "Table does not exist"
- **Fix**: Go back to Supabase SQL Editor
- Make sure you ran the **entire** `supabase-schema.sql` file
- Click **Table Editor** to verify tables exist

### "Cannot execute complex SQL query"
- **Info**: Some advanced queries need an RPC function
- **Impact**: Most features still work fine
- **Optional Fix**: See `SUPABASE-MIGRATION.md` for RPC setup

### Server won't start / Module errors
```bash
npm install
npm start
```

### Port 3000 already in use
- Change port: `PORT=3001 npm start`
- Or kill process on port 3000

---

## 📚 Additional Resources

- **Quick Start**: `SUPABASE-QUICKSTART.md`
- **Detailed Migration**: `SUPABASE-MIGRATION.md`
- **What Changed**: `MIGRATION-SUMMARY.md`
- **Feature List**: `FEATURES.md`
- **Full README**: `README.md`

---

## 🆘 Still Need Help?

1. Check Supabase Dashboard → Table Editor (verify tables exist)
2. Check browser console (F12) for errors
3. Check terminal for server errors
4. Review error messages carefully

---

## 🔄 Reverting to SQLite

If you want to go back to the original SQLite version:

```bash
Copy-Item database-sqlite.js.backup database.js
npm install sqlite3 connect-sqlite3
npm start
```

---

**Ready to start?** Jump to Step 1! 🚀
