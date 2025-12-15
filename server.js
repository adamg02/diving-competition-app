require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('./auth');
const config = require('./config');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (supports live polling)
  message: 'Too many requests from this IP, please try again later.'
});

// Session configuration
app.use(session({
  ...config.session,
  store: new SQLiteStore({ db: 'sessions.db', dir: './' })
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// ==================== AUTHENTICATION ROUTES ====================

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Facebook OAuth routes
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Microsoft OAuth routes
app.get('/auth/microsoft',
  passport.authenticate('microsoft', { prompt: 'select_account' })
);

app.get('/auth/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Logout route
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.redirect('/login.html');
  });
});

// Get current user
app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Middleware to check if user is admin
function ensureAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}


// ==================== COMPETITION MANAGEMENT ENDPOINTS ====================

// Get all competitions
app.get('/api/competitions', (req, res) => {
  db.all('SELECT * FROM competitions ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ competitions: rows });
  });
});

// Get single competition
app.get('/api/competitions/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM competitions WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Competition not found' });
    }
    res.json({ competition: row });
  });
});

// Create new competition (admin only)
app.post('/api/competitions', ensureAdmin, (req, res) => {
  const { name, date, location, description, num_judges } = req.body;
  
  if (!name || !date || !location) {
    return res.status(400).json({ error: 'Name, date, and location are required' });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Validate num_judges (must be 3 or 5)
  const judgeCount = num_judges || 5;
  if (judgeCount !== 3 && judgeCount !== 5) {
    return res.status(400).json({ error: 'Number of judges must be 3 or 5' });
  }

  const sql = 'INSERT INTO competitions (name, date, location, description, num_judges) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [name, date, location, description, judgeCount], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Competition created successfully',
      competition: { id: this.lastID, name, date, location, description, num_judges: judgeCount }
    });
  });
});

// Update competition (admin only)
app.put('/api/competitions/:id', ensureAdmin, (req, res) => {
  const { id } = req.params;
  const { name, date, location, description, num_judges } = req.body;

  // Validate date format if provided
  if (date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
  }

  // Validate num_judges if provided (must be 3 or 5)
  if (num_judges && num_judges !== 3 && num_judges !== 5) {
    return res.status(400).json({ error: 'Number of judges must be 3 or 5' });
  }

  const sql = `UPDATE competitions SET name = ?, date = ?, location = ?, description = ?, num_judges = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db.run(sql, [name, date, location, description, num_judges || 5, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }
    res.json({ 
      message: 'Competition updated successfully',
      competition: { id, name, date, location, description }
    });
  });
});

// Delete competition (admin only)
app.delete('/api/competitions/:id', ensureAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM competitions WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }
    res.json({ message: 'Competition deleted successfully' });
  });
});

// ==================== EVENT MANAGEMENT ENDPOINTS ====================

// Get all events for a competition
app.get('/api/competitions/:competitionId/events', (req, res) => {
  const { competitionId } = req.params;
  db.all('SELECT * FROM events WHERE competition_id = ? ORDER BY name', [competitionId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ events: rows });
  });
});

// Get single event
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ event: row });
  });
});

// Create new event within a competition
app.post('/api/competitions/:competitionId/events', (req, res) => {
  const { competitionId } = req.params;
  const { name, description, num_dives } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Event name is required' });
  }

  const diveCount = num_dives || 6;
  const sql = 'INSERT INTO events (competition_id, name, description, num_dives) VALUES (?, ?, ?, ?)';
  db.run(sql, [competitionId, name, description, diveCount], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Event created successfully',
      event: { id: this.lastID, competition_id: competitionId, name, description, num_dives: diveCount }
    });
  });
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, num_dives } = req.body;

  const sql = `UPDATE events SET name = ?, description = ?, num_dives = ? WHERE id = ?`;
  
  db.run(sql, [name, description, num_dives || 6, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ 
      message: 'Event updated successfully',
      event: { id, name, description }
    });
  });
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

// ==================== COMPETITOR MANAGEMENT ENDPOINTS ====================

// Get all competitors for an event
app.get('/api/events/:eventId/competitors', (req, res) => {
  const { eventId } = req.params;
  db.all('SELECT * FROM competitors WHERE event_id = ?', [eventId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ competitors: rows });
  });
});

// Get all competitors for a competition (across all events)
app.get('/api/competitions/:competitionId/competitors', (req, res) => {
  const { competitionId } = req.params;
  const sql = `
    SELECT c.*, e.name as event_name 
    FROM competitors c
    JOIN events e ON c.event_id = e.id
    WHERE e.competition_id = ?
    ORDER BY e.name, c.last_name, c.first_name
  `;
  db.all(sql, [competitionId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ competitors: rows });
  });
});

// Get single competitor
app.get('/api/competitors/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM competitors WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    res.json({ competitor: row });
  });
});

// Add competitor to event
app.post('/api/events/:eventId/competitors', (req, res) => {
  const { eventId } = req.params;
  const { first_name, last_name, club } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  const sql = 'INSERT INTO competitors (event_id, first_name, last_name, club) VALUES (?, ?, ?, ?)';
  db.run(sql, [eventId, first_name, last_name, club], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Competitor added successfully',
      competitor: { id: this.lastID, event_id: eventId, first_name, last_name, club }
    });
  });
});

// Update competitor
app.put('/api/competitors/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, club } = req.body;

  const sql = `UPDATE competitors 
               SET first_name = ?, last_name = ?, club = ?
               WHERE id = ?`;
  
  db.run(sql, [first_name, last_name, club, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    res.json({
      message: 'Competitor updated successfully',
      competitor: { id, first_name, last_name, club }
    });
  });
});

// Delete competitor
app.delete('/api/competitors/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM competitors WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    res.json({ message: 'Competitor deleted successfully' });
  });
});

// ==================== ENTRY REGISTRATION ENDPOINTS ====================

// Get all entries for a competitor
app.get('/api/competitors/:competitorId/entries', (req, res) => {
  const { competitorId } = req.params;
  db.all('SELECT * FROM entries WHERE competitor_id = ? ORDER BY dive_number', [competitorId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ entries: rows });
  });
});

// Register entry (add dive to competitor's sheet)
app.post('/api/competitors/:competitorId/entries', (req, res) => {
  const { competitorId } = req.params;
  const { fina_code, board_height, difficulty, description } = req.body;

  if (!fina_code || !board_height || !difficulty) {
    return res.status(400).json({ error: 'FINA code, board height, and difficulty are required' });
  }

  // Validate board height
  const validHeights = ['1m', '3m', '5m', '7.5m', '10m'];
  if (!validHeights.includes(board_height)) {
    return res.status(400).json({ error: 'Board height must be one of: 1m, 3m, 5m, 7.5m, 10m' });
  }

  // Validate FINA code format (e.g., 107B, 305C, 5152B)
  const normalizedFinaCode = fina_code.toUpperCase();
  const finaCodeRegex = /^[1-6]\d{2,3}[A-D]$/;
  if (!finaCodeRegex.test(normalizedFinaCode)) {
    return res.status(400).json({ error: 'Invalid FINA code format. Example: 107B, 305C' });
  }

  // Validate difficulty range
  if (difficulty < 1.0 || difficulty > 4.5) {
    return res.status(400).json({ error: 'Difficulty must be between 1.0 and 4.5' });
  }

  // Get next dive number for this competitor
  db.get('SELECT COUNT(*) as count FROM entries WHERE competitor_id = ?', [competitorId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const dive_number = row.count + 1;
    const sql = 'INSERT INTO entries (competitor_id, dive_number, fina_code, board_height, difficulty, description) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [competitorId, dive_number, normalizedFinaCode, board_height, difficulty, description], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Entry registered successfully',
        entry: { id: this.lastID, competitor_id: competitorId, dive_number, fina_code: normalizedFinaCode, board_height, difficulty, description }
      });
    });
  });
});

// Update entry
app.put('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  const { dive_number, fina_code, board_height, difficulty, description } = req.body;

  // Validate board height if provided
  if (board_height) {
    const validHeights = ['1m', '3m', '5m', '7.5m', '10m'];
    if (!validHeights.includes(board_height)) {
      return res.status(400).json({ error: 'Board height must be one of: 1m, 3m, 5m, 7.5m, 10m' });
    }
  }

  // Normalize and validate FINA code format if provided
  let normalizedFinaCode = fina_code;
  if (fina_code) {
    normalizedFinaCode = fina_code.toUpperCase();
    const finaCodeRegex = /^[1-6]\d{2,3}[A-D]$/;
    if (!finaCodeRegex.test(normalizedFinaCode)) {
      return res.status(400).json({ error: 'Invalid FINA code format. Example: 107B, 305C' });
    }
  }

  // Validate difficulty range if provided
  if (difficulty && (difficulty < 1.0 || difficulty > 4.5)) {
    return res.status(400).json({ error: 'Difficulty must be between 1.0 and 4.5' });
  }

  const sql = `UPDATE entries SET fina_code = ?, board_height = ?, difficulty = ?, description = ? WHERE id = ?`;
  
  db.run(sql, [normalizedFinaCode, board_height, difficulty, description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({
      message: 'Entry updated successfully',
      entry: { id, fina_code: normalizedFinaCode, board_height, difficulty, description }
    });
  });
});

// Delete entry
app.delete('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM entries WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  });
});

// ==================== DIVE SHEET ENDPOINTS ====================

// Get dive sheet for a competitor
app.get('/api/competitors/:competitorId/dive-sheet', (req, res) => {
  const { competitorId } = req.params;
  
  // Get dive sheet status
  db.get('SELECT * FROM dive_sheets WHERE competitor_id = ?', [competitorId], (err, sheet) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Get all entries for the competitor
    db.all('SELECT * FROM entries WHERE competitor_id = ? ORDER BY dive_number', [competitorId], (err, entries) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        dive_sheet: sheet || { competitor_id: competitorId, status: 'draft' },
        entries: entries
      });
    });
  });
});

// Submit dive sheet
app.post('/api/competitors/:competitorId/dive-sheet/submit', (req, res) => {
  const { competitorId } = req.params;

  // Check if dive sheet already exists
  db.get('SELECT * FROM dive_sheets WHERE competitor_id = ?', [competitorId], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (existing) {
      // Update existing dive sheet
      const sql = `UPDATE dive_sheets 
                   SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                   WHERE competitor_id = ?`;
      db.run(sql, [competitorId], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Dive sheet submitted successfully', status: 'submitted' });
      });
    } else {
      // Create new dive sheet
      const sql = 'INSERT INTO dive_sheets (competitor_id, status, submitted_at) VALUES (?, ?, CURRENT_TIMESTAMP)';
      db.run(sql, [competitorId, 'submitted'], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Dive sheet submitted successfully', status: 'submitted' });
      });
    }
  });
});

// Reopen dive sheet for editing
app.post('/api/competitors/:competitorId/dive-sheet/reopen', (req, res) => {
  const { competitorId } = req.params;

  const sql = `UPDATE dive_sheets 
               SET status = 'draft', updated_at = CURRENT_TIMESTAMP
               WHERE competitor_id = ?`;
  
  db.run(sql, [competitorId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Dive sheet reopened for editing', status: 'draft' });
  });
});

// ===== JUDGE SCORING ENDPOINTS =====

// Get all entries for an event (for judges to score)
app.get('/api/events/:eventId/entries', (req, res) => {
  const { eventId } = req.params;
  
  const sql = `SELECT e.*, c.first_name, c.last_name, c.club,
               (SELECT COUNT(*) FROM scores WHERE scores.entry_id = e.id) as num_scores
               FROM entries e
               JOIN competitors c ON e.competitor_id = c.id
               WHERE c.event_id = ?
               ORDER BY c.last_name, c.first_name, e.dive_number`;
  
  db.all(sql, [eventId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ entries: rows });
  });
});

// Submit a judge's score for an entry
app.post('/api/scores', (req, res) => {
  const { entry_id, judge_number, score } = req.body;
  
  if (!entry_id || !judge_number || score === undefined) {
    return res.status(400).json({ error: 'Entry ID, judge number, and score are required' });
  }
  
  // Validate score (0.0 to 10.0 in 0.5 increments)
  if (score < 0 || score > 10 || (score * 2) % 1 !== 0) {
    return res.status(400).json({ error: 'Score must be between 0 and 10 in 0.5 increments' });
  }
  
  const sql = `INSERT INTO scores (entry_id, judge_number, score) 
               VALUES (?, ?, ?)
               ON CONFLICT(entry_id, judge_number) DO UPDATE SET score = ?, created_at = CURRENT_TIMESTAMP`;
  
  db.run(sql, [entry_id, judge_number, score, score], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Score submitted successfully',
      score: { id: this.lastID, entry_id, judge_number, score }
    });
  });
});

// Get scores for a specific entry
app.get('/api/entries/:entryId/scores', (req, res) => {
  const { entryId } = req.params;
  
  const sql = 'SELECT * FROM scores WHERE entry_id = ? ORDER BY judge_number';
  
  db.all(sql, [entryId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ scores: rows });
  });
});

// Calculate final score for an entry
app.get('/api/entries/:entryId/final-score', (req, res) => {
  const { entryId } = req.params;
  
  // Get the entry to find difficulty and competition settings
  const entrySql = `SELECT e.*, c.event_id, comp.num_judges
                    FROM entries e
                    JOIN competitors c ON e.competitor_id = c.id
                    JOIN events ev ON c.event_id = ev.id
                    JOIN competitions comp ON ev.competition_id = comp.id
                    WHERE e.id = ?`;
  
  db.get(entrySql, [entryId], (err, entry) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const numJudges = entry.num_judges || 5;
    
    // Get all scores for this entry
    const scoresSql = 'SELECT score FROM scores WHERE entry_id = ? ORDER BY score';
    
    db.all(scoresSql, [entryId], (err, scores) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (scores.length === 0) {
        return res.json({ final_score: 0, message: 'No scores submitted yet' });
      }
      
      if (scores.length < numJudges) {
        return res.json({ 
          final_score: null, 
          message: `Waiting for all ${numJudges} judges (${scores.length}/${numJudges} submitted)`,
          scores_received: scores.length,
          scores_needed: numJudges
        });
      }
      
      let scoresArray = scores.map(s => s.score);
      
      // For 5 judges, remove highest and lowest
      if (numJudges === 5 && scoresArray.length >= 5) {
        scoresArray.sort((a, b) => a - b);
        scoresArray = scoresArray.slice(1, -1); // Remove first and last
      }
      
      // Calculate average
      const sum = scoresArray.reduce((acc, score) => acc + score, 0);
      const average = sum / scoresArray.length;
      
      // Multiply by difficulty
      const finalScore = average * entry.difficulty;
      
      res.json({ 
        final_score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
        average_score: Math.round(average * 100) / 100,
        difficulty: entry.difficulty,
        num_judges: numJudges,
        scores_used: scoresArray,
        all_scores: scores.map(s => s.score)
      });
    });
  });
});

// ===== LIVE RESULTS ENDPOINTS =====

// Get current dive order and status for an event
app.get('/api/events/:eventId/live-results', (req, res) => {
  const { eventId } = req.params;
  
  // Get all entries for the event with competitor info and scores
  const sql = `
    SELECT 
      e.id as entry_id,
      e.dive_number,
      e.fina_code,
      e.description,
      e.board_height,
      e.difficulty,
      c.id as competitor_id,
      c.first_name,
      c.last_name,
      c.club,
      comp.num_judges,
      (SELECT COUNT(*) FROM scores WHERE scores.entry_id = e.id) as num_scores,
      (SELECT GROUP_CONCAT(score) FROM scores WHERE scores.entry_id = e.id ORDER BY judge_number) as scores_list
    FROM entries e
    JOIN competitors c ON e.competitor_id = c.id
    JOIN events ev ON c.event_id = ev.id
    JOIN competitions comp ON ev.competition_id = comp.id
    WHERE c.event_id = ?
    ORDER BY c.last_name, c.first_name, e.dive_number
  `;
  
  db.all(sql, [eventId], (err, entries) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Calculate completion status and find next dive
    let nextDiveIndex = -1;
    const processedEntries = entries.map((entry, index) => {
      const isComplete = entry.num_scores >= entry.num_judges;
      
      // Find first incomplete dive as "next"
      if (nextDiveIndex === -1 && !isComplete) {
        nextDiveIndex = index;
      }
      
      return {
        ...entry,
        is_complete: isComplete,
        is_next: false,
        scores_array: entry.scores_list ? entry.scores_list.split(',').map(Number) : []
      };
    });
    
    // Mark the next dive
    if (nextDiveIndex >= 0) {
      processedEntries[nextDiveIndex].is_next = true;
    }
    
    res.json({ 
      entries: processedEntries,
      next_dive_index: nextDiveIndex
    });
  });
});

// Get leaderboard for an event (total scores by competitor)
app.get('/api/events/:eventId/leaderboard', (req, res) => {
  const { eventId } = req.params;
  
  const sql = `
    SELECT 
      c.id as competitor_id,
      c.first_name,
      c.last_name,
      c.club,
      COUNT(e.id) as total_dives,
      SUM(CASE WHEN (SELECT COUNT(*) FROM scores WHERE scores.entry_id = e.id) >= comp.num_judges THEN 1 ELSE 0 END) as completed_dives
    FROM competitors c
    LEFT JOIN entries e ON c.id = e.competitor_id
    JOIN events ev ON c.event_id = ev.id
    JOIN competitions comp ON ev.competition_id = comp.id
    WHERE c.event_id = ?
    GROUP BY c.id
    ORDER BY c.last_name, c.first_name
  `;
  
  db.all(sql, [eventId], (err, competitors) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // For each competitor, calculate their total score
    const promises = competitors.map(competitor => {
      return new Promise((resolve) => {
        const entryScoreSql = `
          SELECT e.id, e.difficulty, comp.num_judges
          FROM entries e
          JOIN competitors c ON e.competitor_id = c.id
          JOIN events ev ON c.event_id = ev.id
          JOIN competitions comp ON ev.competition_id = comp.id
          WHERE e.competitor_id = ?
        `;
        
        db.all(entryScoreSql, [competitor.competitor_id], (err, entries) => {
          if (err || !entries) {
            resolve({ ...competitor, total_score: 0 });
            return;
          }
          
          let totalScore = 0;
          let processedCount = 0;
          
          entries.forEach(entry => {
            const scoresSql = 'SELECT score FROM scores WHERE entry_id = ? ORDER BY score';
            
            db.all(scoresSql, [entry.id], (err, scores) => {
              processedCount++;
              
              if (!err && scores && scores.length >= entry.num_judges) {
                let scoresArray = scores.map(s => s.score);
                
                // Remove highest and lowest for 5 judges
                if (entry.num_judges === 5 && scoresArray.length >= 5) {
                  scoresArray.sort((a, b) => a - b);
                  scoresArray = scoresArray.slice(1, -1);
                }
                
                const average = scoresArray.reduce((sum, s) => sum + s, 0) / scoresArray.length;
                totalScore += average * entry.difficulty;
              }
              
              if (processedCount === entries.length) {
                resolve({ 
                  ...competitor, 
                  total_score: Math.round(totalScore * 100) / 100 
                });
              }
            });
          });
          
          if (entries.length === 0) {
            resolve({ ...competitor, total_score: 0 });
          }
        });
      });
    });
    
    Promise.all(promises).then(results => {
      // Sort by total score descending
      results.sort((a, b) => b.total_score - a.total_score);
      res.json({ leaderboard: results });
    });
  });
});

// ==================== USER MANAGEMENT ENDPOINTS ====================

// Get all users (admin only)
app.get('/api/users', ensureAdmin, (req, res) => {
  db.all('SELECT id, provider, email, display_name, role, profile_photo, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// Update user role (admin only)
app.put('/api/users/:id/role', ensureAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role
  const validRoles = ['viewer', 'judge', 'manager', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be one of: viewer, judge, manager, admin' });
  }

  // Prevent admin from demoting themselves
  if (parseInt(id) === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot change your own admin role' });
  }

  const sql = 'UPDATE users SET role = ? WHERE id = ?';
  db.run(sql, [role, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User role updated successfully', role });
  });
});

// ==================== SERVE FRONTEND ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
