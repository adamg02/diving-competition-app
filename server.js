const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==================== EVENT MANAGEMENT ENDPOINTS ====================

// Get all events
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY date DESC', [], (err, rows) => {
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

// Create new event
app.post('/api/events', (req, res) => {
  const { name, date, location, description } = req.body;
  
  if (!name || !date || !location) {
    return res.status(400).json({ error: 'Name, date, and location are required' });
  }

  const sql = 'INSERT INTO events (name, date, location, description) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, date, location, description], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Event created successfully',
      event: { id: this.lastID, name, date, location, description }
    });
  });
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { name, date, location, description } = req.body;

  const sql = `UPDATE events 
               SET name = ?, date = ?, location = ?, description = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;
  
  db.run(sql, [name, date, location, description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ 
      message: 'Event updated successfully',
      event: { id, name, date, location, description }
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
  const { first_name, last_name, club, age_group } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  const sql = 'INSERT INTO competitors (event_id, first_name, last_name, club, age_group) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [eventId, first_name, last_name, club, age_group], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Competitor added successfully',
      competitor: { id: this.lastID, event_id: eventId, first_name, last_name, club, age_group }
    });
  });
});

// Update competitor
app.put('/api/competitors/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, club, age_group } = req.body;

  const sql = `UPDATE competitors 
               SET first_name = ?, last_name = ?, club = ?, age_group = ?
               WHERE id = ?`;
  
  db.run(sql, [first_name, last_name, club, age_group, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    res.json({
      message: 'Competitor updated successfully',
      competitor: { id, first_name, last_name, club, age_group }
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
  const { dive_number, fina_code, difficulty, description } = req.body;

  if (!dive_number || !fina_code || !difficulty) {
    return res.status(400).json({ error: 'Dive number, FINA code, and difficulty are required' });
  }

  const sql = 'INSERT INTO entries (competitor_id, dive_number, fina_code, difficulty, description) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [competitorId, dive_number, fina_code, difficulty, description], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Entry registered successfully',
      entry: { id: this.lastID, competitor_id: competitorId, dive_number, fina_code, difficulty, description }
    });
  });
});

// Update entry
app.put('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  const { dive_number, fina_code, difficulty, description } = req.body;

  const sql = `UPDATE entries 
               SET dive_number = ?, fina_code = ?, difficulty = ?, description = ?
               WHERE id = ?`;
  
  db.run(sql, [dive_number, fina_code, difficulty, description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({
      message: 'Entry updated successfully',
      entry: { id, dive_number, fina_code, difficulty, description }
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

// ==================== SERVE FRONTEND ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
