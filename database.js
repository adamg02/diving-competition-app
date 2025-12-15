const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'diving_competition.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // First, check if we need to migrate the old structure
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='events'", (err, oldEventsTable) => {
    if (!err && oldEventsTable) {
      // Check if old events table has the old structure (no competition_id column)
      db.all("PRAGMA table_info(events)", (err, columns) => {
        const hasCompetitionId = columns && columns.some(col => col.name === 'competition_id');
        const hasDateColumn = columns && columns.some(col => col.name === 'date');
        
        if (!hasCompetitionId && hasDateColumn) {
          // Old structure detected - need to migrate
          console.log('Migrating old events table to new competitions/events structure...');
          
          // Step 1: Rename old events table to competitions
          db.run(`ALTER TABLE events RENAME TO competitions`, (err) => {
            if (err) {
              console.error('Error renaming events table:', err.message);
              return;
            }
            
            // Step 2: Create new events table
            db.run(`CREATE TABLE IF NOT EXISTS events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              competition_id INTEGER NOT NULL,
              name TEXT NOT NULL,
              description TEXT,
              num_dives INTEGER DEFAULT 6,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
            )`, (err) => {
              if (err) {
                console.error('Error creating new events table:', err.message);
              } else {
                console.log('Migration completed: events table restructured');
              }
            });
          });
        }
      });
    } else {
      // No old table exists, create fresh structure
      createFreshTables();
    }
  });
  
  function createFreshTables() {
    // Competitions table (formerly events)
    db.run(`CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      num_judges INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Events table (specific events within a competition)
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      num_dives INTEGER DEFAULT 6,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Error creating events table:', err.message);
      } else {
        // Check if num_dives column exists, add it if missing
        db.all("PRAGMA table_info(events)", (err, columns) => {
          if (!err && columns) {
            const hasNumDives = columns.some(col => col.name === 'num_dives');
            if (!hasNumDives) {
              db.run(`ALTER TABLE events ADD COLUMN num_dives INTEGER DEFAULT 6`, (err) => {
                if (err) console.error('Error adding num_dives column:', err.message);
                else console.log('Added num_dives column to events table');
              });
            }
          }
        });
      }
    });
  }
  
  // Always ensure competitions table exists
  db.run(`CREATE TABLE IF NOT EXISTS competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    num_judges INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    email TEXT,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_photo TEXT,
    role TEXT DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_id)
  )`);

  // Migration: Add num_dives column to events table if it doesn't exist
  db.all("PRAGMA table_info(events)", (err, columns) => {
    if (!err && columns) {
      const hasNumDives = columns.some(col => col.name === 'num_dives');
      if (!hasNumDives) {
        db.run(`ALTER TABLE events ADD COLUMN num_dives INTEGER DEFAULT 6`, (err) => {
          if (err) {
            console.error('Error adding num_dives column:', err.message);
          } else {
            console.log('Added num_dives column to events table');
          }
        });
      }
    }
  });
  
  // Competitors table
  db.run(`CREATE TABLE IF NOT EXISTS competitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    club TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  )`);

  // Remove age_group column if it exists
  db.get("PRAGMA table_info(competitors)", (err, rows) => {
    // Note: SQLite doesn't support DROP COLUMN directly, so we'll handle it in code
  });

  // Entries table (competitors' dive entries)
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL,
    dive_number INTEGER NOT NULL,
    fina_code TEXT NOT NULL,
    board_height TEXT NOT NULL,
    difficulty REAL NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE
  )`);

  // Add board_height column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE entries ADD COLUMN board_height TEXT`, (err) => {
    // Ignore error if column already exists
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding board_height column:', err.message);
    }
  });

  // Dive sheets table (submission status)
  db.run(`CREATE TABLE IF NOT EXISTS dive_sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    submitted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE
  )`);

  // Scores table (judge scores for each dive entry)
  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    judge_number INTEGER NOT NULL,
    score REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
    UNIQUE(entry_id, judge_number)
  )`);

  // Add num_judges column to competitions if it doesn't exist
  db.run(`ALTER TABLE competitions ADD COLUMN num_judges INTEGER DEFAULT 5`, (err) => {
    // Ignore error if column already exists
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding num_judges column:', err.message);
    }
  });

  // Run orders table (stores the running order for events)
  db.run(`CREATE TABLE IF NOT EXISTS run_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    competitor_id INTEGER NOT NULL,
    run_position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE,
    UNIQUE(event_id, competitor_id),
    UNIQUE(event_id, run_position)
  )`);

  // Add is_running column to events if it doesn't exist
  db.run(`ALTER TABLE events ADD COLUMN is_running INTEGER DEFAULT 0`, (err) => {
    // Ignore error if column already exists
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding is_running column:', err.message);
    }
  });

  // Add event_status column to events if it doesn't exist
  db.run(`ALTER TABLE events ADD COLUMN event_status TEXT DEFAULT 'stopped'`, (err) => {
    // Ignore error if column already exists
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding event_status column:', err.message);
    }
  });

  console.log('Database initialized successfully');
});

module.exports = db;
