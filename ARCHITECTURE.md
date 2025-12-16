# Architecture Overview

## Before: SQLite Architecture

```
┌─────────────────┐
│   Frontend      │
│  (HTML/JS/CSS)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Express API   │
│   (server.js)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  database.js    │
│  SQLite Driver  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  diving_competition.db  │
│  (Local File)   │
└─────────────────┘
```

## After: Supabase Architecture

```
┌─────────────────┐
│   Frontend      │
│  (HTML/JS/CSS)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Express API   │
│   (server.js)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  database.js    │
│  Supabase       │
│  Wrapper        │
└────────┬────────┘
         │
         ↓ HTTPS/REST
┌─────────────────┐
│  Supabase       │
│  PostgREST API  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL     │
│  (Cloud)        │
└─────────────────┘
```

## Component Details

### Frontend (Unchanged)
- `public/` folder with HTML, CSS, JavaScript
- Vanilla JavaScript (no frameworks)
- Makes API calls to Express server
- **No changes required**

### Express Server (Minimal Changes)
- `server.js` - Main application server
- RESTful API endpoints
- Only change: Session store updated
- Still uses `db.run()`, `db.get()`, `db.all()`

### Database Layer (Replaced)
- **Old**: `database.js` with SQLite3 driver
- **New**: `database.js` with Supabase client
- Provides same callback API
- Translates SQL to Supabase calls

### Database (Migrated)
- **Old**: Local `diving_competition.db` file
- **New**: Cloud PostgreSQL via Supabase
- Same schema, different engine
- Accessible via Supabase dashboard

## Data Flow Example

### Creating a Competition

```
User Input (Form)
      ↓
POST /api/competitions
      ↓
Express Route Handler
      ↓
db.run(INSERT INTO competitions...)
      ↓
database.js parses SQL
      ↓
supabase.from('competitions').insert(...)
      ↓
HTTPS POST to Supabase API
      ↓
PostgreSQL INSERT
      ↓
Response (new competition ID)
      ↓
JSON Response to Frontend
      ↓
UI Updates
```

## Security Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ HTTP
       ↓
┌──────────────┐     Environment Variables
│   Express    │ ←── (.env file)
│   Server     │     - SUPABASE_URL
└──────┬───────┘     - SUPABASE_ANON_KEY
       │ HTTPS
       ↓
┌──────────────┐
│   Supabase   │
│   API        │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  PostgreSQL  │
│  + RLS       │
└──────────────┘
```

## Database Schema

```
competitions (Competition events like "Regional Championship 2025")
    ↓
events (Specific events like "Men's 3m Springboard")
    ↓
competitors (Individual divers registered for the event)
    ↓
entries (Each dive entry with FINA code, difficulty)
    ↓
scores (Judge scores for each dive)

run_orders (Order in which competitors perform)
    ↑
    └─ Links to competitors

users (Authentication - OAuth providers)
```

## API Endpoints (Unchanged)

All existing endpoints continue to work:

```
Competitions
  GET    /api/competitions
  POST   /api/competitions
  PUT    /api/competitions/:id
  DELETE /api/competitions/:id

Events
  GET    /api/events/competition/:competitionId
  POST   /api/events
  PUT    /api/events/:id
  DELETE /api/events/:id

Competitors
  GET    /api/competitors/event/:eventId
  POST   /api/competitors
  PUT    /api/competitors/:id
  DELETE /api/competitors/:id

Dive Sheets
  GET    /api/competitors/:competitorId/dive-sheet
  POST   /api/entries
  PUT    /api/entries/:id
  DELETE /api/entries/:id

Scores
  GET    /api/events/:eventId/scores
  POST   /api/scores

Run Order
  POST   /api/events/:eventId/run-order
  GET    /api/events/:eventId/run-order
  DELETE /api/events/:eventId/run-order

Results
  GET    /api/events/:eventId/live-results
  GET    /api/competitions/:competitionId/active-event
```

## Query Translation Examples

### Simple SELECT
```javascript
// SQLite syntax (unchanged in server.js)
db.all('SELECT * FROM competitors WHERE event_id = ?', [eventId], callback)

// Translated by database.js to:
supabase.from('competitors').select('*').eq('event_id', eventId)
```

### INSERT
```javascript
// SQLite syntax (unchanged in server.js)
db.run('INSERT INTO competitions (name, date, location) VALUES (?, ?, ?)', 
  [name, date, location], callback)

// Translated by database.js to:
supabase.from('competitions')
  .insert({ name, date, location })
  .select()
```

### UPDATE
```javascript
// SQLite syntax (unchanged in server.js)
db.run('UPDATE events SET event_status = ? WHERE id = ?', 
  [status, id], callback)

// Translated by database.js to:
supabase.from('events')
  .update({ event_status: status })
  .eq('id', id)
  .select()
```

## Environment Variables

```env
# Required for Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Optional for OAuth (unchanged)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# Session secret (unchanged)
SESSION_SECRET=your-secret-here
```

## File Structure Changes

```
diving-competition-app/
├── database.js                    [REPLACED] Now uses Supabase
├── database-sqlite.js.backup      [NEW] Backup of original
├── database-supabase.js           [NEW] Alternative version
├── supabase-schema.sql            [NEW] PostgreSQL schema
├── .env.example                   [NEW] Environment template
├── SETUP.md                       [NEW] Setup instructions
├── SUPABASE-QUICKSTART.md         [NEW] Quick guide
├── SUPABASE-MIGRATION.md          [NEW] Detailed guide
├── MIGRATION-SUMMARY.md           [NEW] Technical summary
├── MIGRATION-CHECKLIST.md         [NEW] Testing checklist
├── MIGRATION-COMPLETE.md          [NEW] Status document
├── ARCHITECTURE.md                [THIS FILE]
├── server.js                      [MODIFIED] Session store only
├── package.json                   [MODIFIED] Dependencies
├── README.md                      [MODIFIED] Setup instructions
└── [all other files unchanged]
```

## Session Storage

### Before (SQLite)
```javascript
const SQLiteStore = require('connect-sqlite3')(session);
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' })
}));
```

### After (Memory Store)
```javascript
// No external store needed
app.use(session({
  // Uses default memory store
  // Sessions lost on server restart
}));
```

### Future (Supabase-backed)
```javascript
// Can implement custom session store using Supabase
// Store sessions in Supabase 'sessions' table
// Requires custom SessionStore implementation
```

## Benefits Summary

| Aspect | SQLite | Supabase |
|--------|--------|----------|
| Setup | ✅ None needed | ⚠️ Requires account |
| Scalability | ⚠️ Limited | ✅ Excellent |
| Backups | ❌ Manual | ✅ Automatic |
| Concurrent Users | ⚠️ Limited | ✅ Unlimited |
| Real-time | ❌ Not built-in | ✅ Built-in |
| Cost | ✅ Free | ✅ Free tier available |
| Internet | ✅ Not required | ⚠️ Required |
| Data Size | ⚠️ Limited | ✅ Scalable |
