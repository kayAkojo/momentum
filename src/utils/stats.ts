import { format, subDays } from 'date-fns'

export const toISODate = (d: Date) => format(d, 'yyyy-MM-dd')

// Current streak = consecutive days ending today (or yesterday, grace).
export function currentStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const today = new Date()
  let cursor = today
  if (!dates.has(toISODate(cursor))) {
    cursor = subDays(today, 1)
    if (!dates.has(toISODate(cursor))) return 0
  }
  let streak = 0
  while (dates.has(toISODate(cursor))) {
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

export function bestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const sorted = [...dates].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    const cur = new Date(sorted[i] + 'T00:00:00')
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86_400_000)
    if (diff === 1) {
      run++
      if (run > best) best = run
    } else {
      run = 1
    }
  }
  return best
}

export function completionRate(dates: Set<string>, windowDays = 30): number {
  if (windowDays <= 0) return 0
  let count = 0
  for (let i = 0; i < windowDays; i++) {
    if (dates.has(toISODate(subDays(new Date(), i)))) count++
  }
  return Math.round((count / windowDays) * 100)
}

export interface DayCompletion {
  date: string
  label: string
  done: number
  total: number
}

export function dailyCompletions(
  checkins: { habitId: number; date: string }[],
  habitCount: number,
  days = 7,
): DayCompletion[] {
  const out: DayCompletion[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i)
    const iso = toISODate(d)
    const distinct = new Set<number>()
    for (const c of checkins) {
      if (c.date === iso) distinct.add(c.habitId)
    }
    out.push({
      date: iso,
      label: format(d, 'EEE'),
      done: distinct.size,
      total: habitCount,
    })
  }
  return out
}