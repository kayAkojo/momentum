import { useGoals, useHabits, useAllCheckins } from '../db/hooks'
import {
  currentStreak,
  bestStreak,
  completionRate,
  dailyCompletions,
} from '../utils/stats'
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export function StatsPage() {
  const goals = useGoals() ?? []
  const habits = useHabits() ?? []
  const checkins = useAllCheckins() ?? []

  if (habits.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-base font-semibold text-slate-900">No stats yet</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add goals and habits in the Goals tab, then start checking in.
        </p>
      </div>
    )
  }

  const byHabit = new Map<number, Set<string>>()
  for (const c of checkins) {
    let s = byHabit.get(c.habitId)
    if (!s) {
      s = new Set()
      byHabit.set(c.habitId, s)
    }
    s.add(c.date)
  }

  const allDates = new Set(checkins.map((c) => c.date))
  const overallStreak = currentStreak(allDates)
  const last7 = dailyCompletions(checkins, habits.length, 7)
  const todayDone = last7[last7.length - 1]?.done ?? 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Stats</h2>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Today" value={`${todayDone}/${habits.length}`} />
        <StatCard
          label="Day streak"
          value={overallStreak}
          accent={overallStreak > 0}
        />
        <StatCard label="Check-ins" value={checkins.length} />
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 text-sm mb-3">
          Last 7 days
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="done" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-1">
          Habits completed per day
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="font-semibold text-slate-900 text-sm">By habit</h3>
          <span className="text-[10px] text-slate-400">
            🔥 streak · % last 30d · best
          </span>
        </div>
        <div className="space-y-3">
          {goals.map((goal) => {
            const goalHabits = habits.filter((h) => h.goalId === goal.id)
            if (goalHabits.length === 0) return null
            return (
              <div key={goal.id}>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1">
                  {goal.title}
                </p>
                <ul className="space-y-1.5">
                  {goalHabits.map((h) => {
                    const dates = byHabit.get(h.id!) ?? new Set<string>()
                    const cur = currentStreak(dates)
                    const best = bestStreak(dates)
                    const rate = completionRate(dates, 30)
                    return (
                      <li
                        key={h.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="flex-1 truncate text-slate-700">
                          {h.title}
                        </span>
                        <span
                          className={
                            'text-xs font-medium tabular-nums ' +
                            (cur > 0 ? 'text-orange-600' : 'text-slate-300')
                          }
                        >
                          {cur > 0 ? `🔥 ${cur}` : '—'}
                        </span>
                        <span className="text-[11px] text-slate-500 tabular-nums w-9 text-right">
                          {rate}%
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums w-12 text-right">
                          best {best}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center px-2">
        Streaks have a grace day — miss today, and it stays alive if you checked
        in yesterday.
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
        {label}
      </p>
      <p
        className={
          'text-xl font-bold tabular-nums ' +
          (accent ? 'text-orange-600' : 'text-slate-900')
        }
      >
        {value}
      </p>
    </div>
  )
}