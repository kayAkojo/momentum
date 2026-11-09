import Dexie, { type Table } from 'dexie'
import type { Goal, Habit, Checkin } from './types'

export class AppDB extends Dexie {
  goals!: Table<Goal, number>
  habits!: Table<Habit, number>
  checkins!: Table<Checkin, number>

  constructor() {
    super('momentum')
    this.version(1).stores({
      goals: '++id, archived, createdAt',
      habits: '++id, goalId, archived, sortIndex',
      // The &[habitId+date] is a UNIQUE compound index —
      // prevents the same habit being checked in twice on one day.
      checkins: '++id, habitId, date, &[habitId+date], createdAt',
    })
  }
}

export const db = new AppDB()