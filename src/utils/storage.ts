/**
 * localStorage utilities for data persistence
 */

import type { Event, Competitor, Dive, Score } from '../models';

// Storage keys
const STORAGE_KEYS = {
  EVENTS: 'diving-app-events',
  COMPETITORS: 'diving-app-competitors',
  DIVES: 'diving-app-dives',
  SCORES: 'diving-app-scores',
} as const;

// Generic storage operations
class LocalStorage<T extends { id: string }> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage (${this.key}):`, error);
      return [];
    }
  }

  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item) => item.id === id);
  }

  save(item: T): T {
    const items = this.getAll();
    const existingIndex = items.findIndex((i) => i.id === item.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
      return item;
    } catch (error) {
      console.error(`Error saving to localStorage (${this.key}):`, error);
      throw error;
    }
  }

  saveAll(items: T[]): T[] {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
      return items;
    } catch (error) {
      console.error(`Error saving to localStorage (${this.key}):`, error);
      throw error;
    }
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter((item) => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // Item not found
    }
    
    try {
      localStorage.setItem(this.key, JSON.stringify(filteredItems));
      return true;
    } catch (error) {
      console.error(`Error deleting from localStorage (${this.key}):`, error);
      throw error;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Error clearing localStorage (${this.key}):`, error);
      throw error;
    }
  }
}

// Specific storage instances
export const eventStorage = new LocalStorage<Event>(STORAGE_KEYS.EVENTS);
export const competitorStorage = new LocalStorage<Competitor>(STORAGE_KEYS.COMPETITORS);
export const diveStorage = new LocalStorage<Dive>(STORAGE_KEYS.DIVES);
export const scoreStorage = new LocalStorage<Score>(STORAGE_KEYS.SCORES);

// Helper function to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Helper function to get current ISO timestamp
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// Export all storages as a single object for convenience
export const storage = {
  events: eventStorage,
  competitors: competitorStorage,
  dives: diveStorage,
  scores: scoreStorage,
  generateId,
  getCurrentTimestamp,
};

// Clear all data (useful for testing or reset)
export const clearAllData = (): void => {
  eventStorage.clear();
  competitorStorage.clear();
  diveStorage.clear();
  scoreStorage.clear();
};
