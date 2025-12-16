# Diving Competition App

A comprehensive web application for managing diving competitions, competitors, and dive sheets with FINA dive code support.

> **🆕 Database Migration Notice**: This app has been migrated from SQLite to Supabase (PostgreSQL). 
> 
> **📖 New to this project?** See [SETUP.md](./SETUP.md) for quick start instructions.
> 
> **🔄 Existing user?** See [MIGRATION-COMPLETE.md](./MIGRATION-COMPLETE.md) for migration details.

## Features

### Event Management
- Create and edit diving competition events
- Specify event details including name, date, location, and description
- View all events in an organized list
- Delete events when needed

### Competitor Management
- Add competitors to specific events
- Track competitor information (first name, last name, club, age group)
- Edit competitor details
- Remove competitors from events
- View all competitors registered for each event

### Dive Sheet Functionality
- Input FINA dive codes for each competitor
- **Select board/platform height** (1m, 3m, 5m, 7.5m, 10m springboard/platform)
- **Auto-populate difficulty ratings and descriptions** based on FINA dive code and height
- Height-specific difficulty ratings per FINA standards
- Real-time validation and feedback for dive codes and height availability
- Manage dive difficulty ratings
- Add multiple dive entries per competitor
- Edit and delete dive entries
- Submit dive sheets when finalized
- Reopen submitted dive sheets for editing if needed
- Track submission status

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL) - migrated from SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: RESTful API architecture

## Installation

### Prerequisites
- Node.js (v14 or higher)
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

### Setup

1. Clone the repository:
```bash
git clone https://github.com/adamg02/diving-competition-app.git
cd diving-competition-app
```

2. Install dependencies:
```bash
npm install
```

3. **Set up Supabase database:**
   - Create a new project at [supabase.com](https://supabase.com)
   - In the SQL Editor, run the `supabase-schema.sql` file to create all tables
   - Get your project URL and anon key from Settings > API

4. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the application:**
```bash
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

> **📖 For detailed migration instructions and troubleshooting, see [SUPABASE-MIGRATION.md](./SUPABASE-MIGRATION.md)**
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Competitors
- `GET /api/events/:eventId/competitors` - Get all competitors for an event
- `GET /api/competitors/:id` - Get single competitor
- `POST /api/events/:eventId/competitors` - Add competitor to event
- `PUT /api/competitors/:id` - Update competitor
- `DELETE /api/competitors/:id` - Delete competitor

### Entries
- `GET /api/competitors/:competitorId/entries` - Get all entries for a competitor
- `POST /api/competitors/:competitorId/entries` - Register new entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

### Dive Sheets
- `GET /api/competitors/:competitorId/dive-sheet` - Get dive sheet for competitor
- `POST /api/competitors/:competitorId/dive-sheet/submit` - Submit dive sheet
- `POST /api/competitors/:competitorId/dive-sheet/reopen` - Reopen dive sheet for editing

## Usage

### Managing Events
1. Navigate to the Events page (home page)
2. Click "Create New Event" to add a new competition
3. Fill in the event details and click "Save Event"
4. Edit or delete events using the buttons on each event card

### Managing Competitors
1. Navigate to the Competitors page
2. Select an event from the dropdown
3. Click "Add Competitor" to register a new competitor
4. Fill in competitor details and click "Save Competitor"
5. Edit or delete competitors using the buttons on each competitor card

### Managing Dive Sheets
1. Navigate to the Dive Sheets page
2. Select an event from the dropdown
3. Select a competitor from the second dropdown
4. Click "Add Dive Entry" to input a new dive
5. Enter the dive number and FINA code (e.g., 107B, 305C)
6. Select the board/platform height (1m, 3m, 5m, 7.5m, or 10m)
   - **The difficulty rating and description will automatically populate** based on the FINA code and height
   - System validates if the dive is available from the selected height
   - Difficulty ratings vary by height according to FINA standards
   - You can manually override any auto-filled values if needed
7. Add all required dives for the competitor
8. Click "Submit Dive Sheet" when the sheet is complete
9. Use "Reopen for Editing" if changes are needed after submission

## FINA Dive Code Database

The application includes a comprehensive database of FINA dive codes with automatic lookup of:
- **Height-specific difficulty ratings (DD)** for each board/platform
- Dive descriptions
- Height availability validation

**Supported board/platform heights:**
- **1m Springboard**: Lower difficulty ratings for most dives
- **3m Springboard**: Standard springboard height
- **5m Platform**: Entry-level platform
- **7.5m Platform**: Intermediate platform
- **10m Platform**: Olympic height with highest difficulty ratings

**Supported dive groups:**
- **Forward (1XX)**: 101A-109C (e.g., 107B from 3m - DD: 3.0, from 10m - DD: 3.3)
- **Back (2XX)**: 201A-208C (e.g., 205C from 3m - DD: 2.4, from 10m - DD: 2.6)
- **Reverse (3XX)**: 301A-307C (e.g., 305C from 3m - DD: 2.5, from 10m - DD: 2.7)
- **Inward (4XX)**: 401A-407C (e.g., 403B from 3m - DD: 1.8, from 10m - DD: 2.0)
- **Twisting (5XXX)**: 5122B-5353B (e.g., 5152B from 3m - DD: 2.4, from 10m - DD: 2.6)
- **Armstand (6XX)**: 601A-606C - **Platform only** (e.g., 603B from 10m - DD: 1.8)

**Note:** Difficulty ratings increase with height. Some advanced dives are only available from higher platforms (e.g., 107B requires 3m or higher). Armstand dives are exclusively performed from platform (7.5m and 10m).

The system validates FINA code format, checks height availability, and provides real-time feedback.

## Database Schema

The application uses SQLite with the following tables:

- **events**: Stores competition events
- **competitors**: Stores competitor information linked to events
- **entries**: Stores individual dive entries linked to competitors
- **dive_sheets**: Tracks submission status of dive sheets

## License

MIT