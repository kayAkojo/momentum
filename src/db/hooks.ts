import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

export function useGoals() {
  return useLiveQuery(async () => {
    const all = await db.goals.toArray()
    return all
      .filter((g) => g.archived === 0)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [])
}

export function useHabits(goalId?: number) {
  return useLiveQuery(async () => {
    const all = await db.habits.toArray()
    return all
      .filter((h) => h.archived === 0)
      .filter((h) => goalId === undefined || h.goalId === goalId)
      .sort((a, b) => a.sortIndex - b.sortIndex)
  }, [goalId])
}

export function useAllCheckins() {
  return useLiveQuery(() => db.checkins.toArray(), [])
}

export function useCheckinsForDate(date: string) {
  return useLiveQuery(
    () => db.checkins.where('date').equals(date).toArray(),
    [date],
  )
}