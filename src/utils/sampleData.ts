/**
 * Example usage and testing utilities for the storage layer
 */

import {
  storage,
  generateId,
  getCurrentTimestamp,
} from './storage';
import type { Event, Competitor, Dive, Score } from '../models';

/**
 * Create a sample event for testing
 */
export const createSampleEvent = (): Event => {
  const now = getCurrentTimestamp();
  return {
    id: generateId(),
    name: 'Regional Diving Championship 2025',
    date: '2025-03-15',
    location: 'Springfield Aquatic Center',
    description: 'Annual regional diving competition',
    competitorIds: [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a sample competitor for testing
 */
export const createSampleCompetitor = (eventId: string): Competitor => {
  const now = getCurrentTimestamp();
  return {
    id: generateId(),
    name: 'Jane Doe',
    age: 18,
    club: 'Springfield Diving Club',
    eventId,
    diveIds: [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a sample dive for testing
 */
export const createSampleDive = (competitorId: string): Dive => {
  const now = getCurrentTimestamp();
  return {
    id: generateId(),
    competitorId,
    diveNumber: '107C',
    diveType: 'forward',
    position: 'tuck',
    difficulty: 2.8,
    scoreIds: [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a sample score for testing
 */
export const createSampleScore = (diveId: string, judgeNumber: number, value: number): Score => {
  const now = getCurrentTimestamp();
  return {
    id: generateId(),
    diveId,
    judgeNumber,
    value,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Populate the storage with sample data for testing
 */
export const populateSampleData = (): void => {
  // Create an event
  const event = createSampleEvent();
  storage.events.save(event);

  // Create a competitor
  const competitor = createSampleCompetitor(event.id);
  storage.competitors.save(competitor);

  // Update event with competitor ID
  event.competitorIds.push(competitor.id);
  event.updatedAt = getCurrentTimestamp();
  storage.events.save(event);

  // Create a dive
  const dive = createSampleDive(competitor.id);
  storage.dives.save(dive);

  // Update competitor with dive ID
  competitor.diveIds.push(dive.id);
  competitor.updatedAt = getCurrentTimestamp();
  storage.competitors.save(competitor);

  // Create scores
  const scores = [
    createSampleScore(dive.id, 1, 7.5),
    createSampleScore(dive.id, 2, 8.0),
    createSampleScore(dive.id, 3, 7.5),
    createSampleScore(dive.id, 4, 8.5),
    createSampleScore(dive.id, 5, 7.0),
  ];

  scores.forEach(score => {
    storage.scores.save(score);
    dive.scoreIds.push(score.id);
  });

  // Update dive with score IDs
  dive.updatedAt = getCurrentTimestamp();
  storage.dives.save(dive);

  console.log('Sample data populated successfully!');
};

/**
 * Log all stored data to the console
 */
export const logAllData = (): void => {
  console.log('Events:', storage.events.getAll());
  console.log('Competitors:', storage.competitors.getAll());
  console.log('Dives:', storage.dives.getAll());
  console.log('Scores:', storage.scores.getAll());
};
