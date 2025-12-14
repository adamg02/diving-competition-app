/**
 * Data models for the diving competition application
 */

// Event represents a diving competition event
export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  competitorIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Competitor represents a participant in the competition
export interface Competitor {
  id: string;
  name: string;
  age: number;
  club?: string;
  eventId: string;
  diveIds: string[];
  createdAt: string;
  updatedAt: string;
}

// DiveType represents the type of dive being performed
export type DiveType = 
  | 'forward'
  | 'back'
  | 'reverse'
  | 'inward'
  | 'twister'
  | 'armstand';

// Position represents the body position during the dive
export type Position = 
  | 'straight'
  | 'pike'
  | 'tuck'
  | 'free';

// Dive represents a single dive performed by a competitor
export interface Dive {
  id: string;
  competitorId: string;
  diveNumber: string; // e.g., "107C" (forward 3½ somersaults tuck)
  diveType: DiveType;
  position: Position;
  difficulty: number; // Degree of difficulty (DD)
  scoreIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Score represents a judge's score for a specific dive
export interface Score {
  id: string;
  diveId: string;
  judgeNumber: number;
  value: number; // Score value (typically 0-10)
  createdAt: string;
  updatedAt: string;
}

// Computed score for a dive (after applying DD and dropping high/low)
export interface ComputedDiveScore {
  diveId: string;
  scores: number[];
  adjustedScores: number[]; // After dropping high/low
  totalScore: number; // Sum of adjusted scores * DD
  difficulty: number;
}
