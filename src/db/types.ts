export interface Goal {
  id?: number
  title: string
  why?: string // identity statement, e.g. "I'm someone who moves daily"
  targetDate?: string // 'YYYY-MM-DD'
  createdAt: string // ISO datetime
  archived: 0 | 1
}

export interface Habit {
  id?: number
  goalId: number
  title: string
  cue?: string // e.g. "After I pour my morning coffee…"
  sortIndex: number
  createdAt: string
  archived: 0 | 1
}

export interface Checkin {
  id?: number
  habitId: number
  date: string // 'YYYY-MM-DD'
  note?: string
  createdAt: string
}