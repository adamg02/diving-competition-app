# Features Documentation

This document describes all features implemented in the Diving Competition App.

## 1. Event Management

### Create Events
- Navigate to the home page
- Click "Create New Event" button
- Fill in event details:
  - **Event Name** (required): Name of the competition
  - **Date** (required): Date in YYYY-MM-DD format
  - **Location** (required): Venue location
  - **Description** (optional): Additional event information
- Click "Save Event"

### Edit Events
- Click "Edit" button on any event card
- Modify the event details
- Click "Save Event" to update

### Delete Events
- Click "Delete" button on any event card
- Confirm deletion
- **Note**: Deleting an event will also delete all associated competitors and their dive entries

### View Events
- All events are displayed on the home page
- Events show name, date, location, and description
- Events are ordered by date (newest first)

## 2. Competitor Management

### Add Competitors
- Navigate to the "Competitors" page
- Select an event from the dropdown
- Click "Add Competitor" button
- Fill in competitor details:
  - **First Name** (required)
  - **Last Name** (required)
  - **Club** (optional): Competitor's diving club
  - **Age Group** (optional): e.g., Junior, Senior
- Click "Save Competitor"

### Edit Competitors
- Select an event to view its competitors
- Click "Edit" button on any competitor card
- Modify the competitor details
- Click "Save Competitor" to update

### Delete Competitors
- Click "Delete" button on any competitor card
- Confirm deletion
- **Note**: Deleting a competitor will also delete all their dive entries

### View Competitors
- Select an event to see all registered competitors
- Competitors display name, club, and age group

## 3. Dive Sheet Management

### Access Dive Sheets
- Navigate to the "Dive Sheets" page
- Select an event from the first dropdown
- Select a competitor from the second dropdown
- The dive sheet for that competitor will be displayed

### Add Dive Entries
- Click "Add Dive Entry" button
- Fill in dive details:
  - **Dive Number** (required): Position in the dive list (1, 2, 3, etc.)
  - **FINA Code** (required): Official FINA dive code (e.g., 107B, 305C, 5152B)
  - **Board/Platform Height** (required): Select from 1m, 3m, 5m, 7.5m, or 10m
    - **HEIGHT-SPECIFIC DIFFICULTY**: Each dive has different difficulty ratings per height
    - Lower heights (1m, 3m springboards) generally have lower DD
    - Higher platforms (7.5m, 10m) have higher DD for the same dive
    - Some dives are only available from certain heights (e.g., armstands from platform only)
    - **AUTO-FILL FEATURE**: When you enter a valid FINA code AND select a height:
      - **Difficulty Rating**: Retrieved from FINA database for that specific height
      - **Description**: Full dive name (e.g., "Forward 3½ Somersaults Pike")
      - **Height Validation**: System warns if dive is not available from selected height
    - Visual feedback with green highlight shows auto-filled fields
    - You can manually override any auto-filled values if needed
  - **Difficulty Rating** (auto-filled or manual): Between 1.0 and 4.5
  - **Description** (auto-filled or manual): Dive name or description
- Click "Save Entry"
- The system includes 150+ official FINA dive codes with height-specific DDs covering all dive groups and heights

### FINA Code Format
FINA codes must follow the standard format:
- First digit (1-6): Direction of dive
  - 1: Forward
  - 2: Back
  - 3: Reverse
  - 4: Inward
  - 5: Twisting
  - 6: Armstand
- Next 2-3 digits: Dive number
- Last letter (A-D): Position
  - A: Straight
  - B: Pike
  - C: Tuck
  - D: Free

Examples: 107B, 305C, 203B, 5152B

### Edit Dive Entries
- Click "Edit" button on any dive entry
- Modify the dive details
- Click "Save Entry" to update
- **Note**: Entries cannot be edited after the dive sheet is submitted

### Delete Dive Entries
- Click "Delete" button on any dive entry
- Confirm deletion
- **Note**: Entries cannot be deleted after the dive sheet is submitted

### Submit Dive Sheet
- After adding all dive entries
- Click "Submit Dive Sheet" button
- Confirm submission
- Once submitted, the dive sheet status changes to "Submitted"
- Submitted dive sheets cannot be edited or have entries modified

### Reopen Dive Sheet
- If changes are needed after submission
- Click "Reopen for Editing" button
- Confirm reopening
- The dive sheet status returns to "Draft"
- Entries can now be edited, added, or deleted again

## 4. Dive Sheet Status

### Draft Status
- Initial status when a competitor is registered
- Allows full editing of dive entries
- Add, edit, or delete entries freely
- Can be submitted at any time

### Submitted Status
- Set when "Submit Dive Sheet" is clicked
- Locks the dive sheet from editing
- No entries can be added, edited, or deleted
- Can be reopened if needed

## 5. Data Validation

The application enforces the following validation rules:

### Events
- Name, date, and location are required
- Date must be in YYYY-MM-DD format

### Competitors
- First name and last name are required
- Club and age group are optional

### Dive Entries
- Dive number, FINA code, and difficulty are required
- FINA code must match the standard format (e.g., 107B, 305C)
- Difficulty must be between 1.0 and 4.5
- Description is optional

## 6. API Rate Limiting

To protect against abuse, the API implements rate limiting:
- Maximum 100 requests per 15 minutes per IP address
- Applies to all API endpoints
- Exceeding the limit returns an error message

## 7. User Interface Features

### Responsive Design
- Works on desktop and mobile devices
- Adapts layout for smaller screens
- Touch-friendly buttons and inputs

### Real-time Feedback
- Success and error messages for all actions
- Form validation with helpful error messages
- Confirmation dialogs for destructive actions (delete)

### Navigation
- Clear navigation menu at the top
- Easy switching between Events, Competitors, and Dive Sheets pages
- Dropdown selectors for filtering by event and competitor

### Visual Design
- Clean, professional interface
- Color-coded actions (blue for primary, red for delete, etc.)
- Card-based layout for easy scanning
- Consistent styling throughout

## 8. Database

### Technology
- SQLite database for data persistence
- Relational schema with proper foreign keys
- Cascade deletion for maintaining data integrity

### Tables
- **events**: Stores competition events
- **competitors**: Stores competitor information
- **entries**: Stores dive entries
- **dive_sheets**: Tracks submission status

### Backup
- Database file: `diving_competition.db`
- Can be backed up by copying this file
- Restore by replacing the database file

## Future Enhancements

Potential features for future development:
- Scoring system for judges
- Heat and round management
- Competitor photo uploads
- Results calculation and leaderboards
- Export to PDF/Excel
- User authentication and roles
- Multi-event registration
- Email notifications
- Real-time updates via WebSockets
