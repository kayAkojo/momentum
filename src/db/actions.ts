import { db } from './db'
import type { Goal, Habit } from './types'

const now = () => new Date().toISOString()

export async function addGoal(input: Pick<Goal, 'title' | 'why' | 'targetDate'>) {
  return db.goals.add({
    ...input,
    createdAt: now(),
    archived: 0,
  })
}

export async function addHabit(input: Pick<Habit, 'goalId' | 'title' | 'cue'>) {
  const siblings = await db.habits.where('goalId').equals(input.goalId).toArray()
  const sortIndex = siblings.reduce((m, h) => Math.max(m, h.sortIndex), -1) + 1
  return db.habits.add({
    ...input,
    sortIndex,
    createdAt: now(),
    archived: 0,
  })
}

export async function toggleCheckin(habitId: number, date: string) {
  const existing = await db.checkins
    .where('[habitId+date]')
    .equals([habitId, date])
    .first()

  if (existing?.id) {
    await db.checkins.delete(existing.id)
    return false
  }
  await db.checkins.add({ habitId, date, createdAt: now() })
  return true
}

export async function clearAll() {
  await db.transaction('rw', db.goals, db.habits, db.checkins, async () => {
    await db.checkins.clear()
    await db.habits.clear()
    await db.goals.clear()
  })
}