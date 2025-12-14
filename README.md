# Diving Competition App

A web application for managing diving competitions, built with React, TypeScript, and Vite.

## Features

- **Event Management**: Create and manage diving competition events
- **Competitor Tracking**: Register competitors and track their performance
- **Dive Recording**: Record individual dives with difficulty ratings
- **Score Management**: Enter and calculate judge scores
- **Responsive Design**: Built with Tailwind CSS for optimal viewing on all devices

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **localStorage** - Client-side data persistence

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

```bash
# Build for production
npm run build
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
src/
├── models/          # Data models and TypeScript interfaces
│   └── index.ts     # Event, Competitor, Dive, Score models
├── utils/           # Utility functions
│   └── storage.ts   # localStorage persistence layer
├── assets/          # Static assets
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

## Data Models

### Event
Represents a diving competition event with name, date, location, and associated competitors.

### Competitor
Represents a participant in the competition with personal information and dive records.

### Dive
Represents a single dive performed by a competitor, including dive number, type, position, and difficulty.

### Score
Represents a judge's score for a specific dive.

## Data Persistence

The application uses localStorage for temporary data persistence during development. All data is stored locally in the browser and will persist across page refreshes.

## License

MIT

