# ✅ Migration Checklist

Use this checklist to track your migration from SQLite to Supabase.

## Pre-Migration

- [ ] Backup existing SQLite database (if you have data)
  ```bash
  Copy-Item diving_competition.db diving_competition.db.backup
  ```

- [ ] Review current application functionality
- [ ] Note any custom queries or features

## Supabase Setup

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new Supabase project
- [ ] Wait for project provisioning to complete (~2 min)
- [ ] Copy Project URL from Settings → API
- [ ] Copy anon/public API key from Settings → API

## Database Schema

- [ ] Open Supabase SQL Editor
- [ ] Load `supabase-schema.sql` file
- [ ] Execute entire schema file
- [ ] Verify all 8 tables created:
  - [ ] competitions
  - [ ] events
  - [ ] users
  - [ ] competitors
  - [ ] entries
  - [ ] dive_sheets
  - [ ] scores
  - [ ] run_orders
- [ ] Check Table Editor to confirm table structure

## Application Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Add SUPABASE_URL to `.env`
- [ ] Add SUPABASE_ANON_KEY to `.env`
- [ ] Verify `.env` is in `.gitignore` (it already is)

## Code Updates

- [x] Install @supabase/supabase-js package
- [x] Update database.js with Supabase client
- [x] Backup original database.js as database-sqlite.js.backup
- [x] Update server.js session store
- [x] Update package.json dependencies
- [x] Update README.md with Supabase instructions

## Testing

### Basic Functionality
- [ ] Start server successfully (`npm start`)
- [ ] Server connects to Supabase (no connection errors)
- [ ] Homepage loads at http://localhost:3000

### Competition Management
- [ ] Create new competition
- [ ] Edit competition
- [ ] View competitions list
- [ ] Delete competition

### Event Management
- [ ] Add event to competition
- [ ] Edit event details
- [ ] Change number of dives
- [ ] Delete event

### Competitor Management
- [ ] Add competitor to event
- [ ] Edit competitor information
- [ ] View competitors list
- [ ] Delete competitor

### Dive Sheets
- [ ] Create dive sheet entries
- [ ] Select board heights
- [ ] Validate FINA codes
- [ ] Auto-populate difficulty
- [ ] Submit dive sheet
- [ ] Reopen submitted sheet
- [ ] Edit dive entries
- [ ] Delete dive entries

### Run Order System
- [ ] Generate random run order
- [ ] View run order table
- [ ] Start event (status changes)
- [ ] Pause event
- [ ] View live scores on run order page

### Judge Scoring
- [ ] Auto-detect active event
- [ ] View next diver in sequence
- [ ] Submit scores (0-10, 0.5 increments)
- [ ] Auto-advance to next diver
- [ ] Multiple judges scoring same event

### Results Dashboard
- [ ] Auto-load active event
- [ ] View live results
- [ ] See dive-by-dive progress
- [ ] Calculate scores correctly
- [ ] Real-time updates (polling every 2s)

## Performance & Concurrency

- [ ] Test with multiple judges simultaneously
- [ ] Verify no race conditions
- [ ] Check response times acceptable
- [ ] Monitor Supabase dashboard for queries

## Data Migration (if needed)

- [ ] Export existing SQLite data
- [ ] Convert to PostgreSQL format
- [ ] Import into Supabase
- [ ] Verify data integrity
- [ ] Test all migrated records

## Optional Enhancements

- [ ] Create `execute_sql` RPC function for complex queries
- [ ] Configure Row Level Security policies
- [ ] Set up Supabase Auth (if using OAuth)
- [ ] Enable real-time subscriptions
- [ ] Configure database backups

## Documentation

- [x] Create SUPABASE-MIGRATION.md
- [x] Create SUPABASE-QUICKSTART.md
- [x] Create MIGRATION-SUMMARY.md
- [x] Create SETUP.md
- [x] Update README.md
- [x] Create .env.example
- [ ] Document any custom configurations

## Production Readiness

- [ ] Review and tighten RLS policies
- [ ] Set up environment-specific configs
- [ ] Configure production secrets
- [ ] Set up monitoring/logging
- [ ] Plan for database backups
- [ ] Document deployment process
- [ ] Load testing
- [ ] Security audit

## Rollback Plan

- [ ] Keep database-sqlite.js.backup
- [ ] Keep diving_competition.db.backup
- [ ] Document rollback procedure (in MIGRATION-SUMMARY.md)
- [ ] Test rollback process

## Sign-Off

- [ ] All features tested and working
- [ ] No console errors
- [ ] No server errors
- [ ] Documentation complete
- [ ] Team trained on new setup
- [ ] Migration considered successful! 🎉

---

## Notes

Use this space for migration-specific notes, issues encountered, or custom configurations:

```
[Your notes here]
```

---

**Migration Date**: ________________

**Completed By**: ________________

**Status**: 🔄 In Progress / ✅ Complete / ❌ Reverted
