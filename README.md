# Diving Competition App

A comprehensive web application for managing diving competitions, competitors, and dive sheets with FINA dive code support.

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
- Manage dive difficulty ratings
- Add multiple dive entries per competitor
- Edit and delete dive entries
- Submit dive sheets when finalized
- Reopen submitted dive sheets for editing if needed
- Track submission status

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: RESTful API architecture

## Installation

1. Clone the repository:
```bash
git clone https://github.com/adamg02/diving-competition-app.git
cd diving-competition-app
```

2. Install dependencies:
```bash
npm install
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
5. Enter the dive number, FINA code (e.g., 107B, 305C), difficulty rating, and optional description
6. Add all required dives for the competitor
7. Click "Submit Dive Sheet" when the sheet is complete
8. Use "Reopen for Editing" if changes are needed after submission

## Database Schema

The application uses SQLite with the following tables:

- **events**: Stores competition events
- **competitors**: Stores competitor information linked to events
- **entries**: Stores individual dive entries linked to competitors
- **dive_sheets**: Tracks submission status of dive sheets

## License

MIT