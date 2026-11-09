import { useHabits, useAllCheckins } from '../db/hooks'
import { subDays } from 'date-fns'
import { toISODate } from '../utils/stats'

export function ReportPage() {
  const habits = useHabits() ?? []
  const checkins = useAllCheckins() ?? []

  if (habits.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
        <div className="text-4xl mb-3">📝</div>
        <h2 className="text-base font-semibold text-slate-900">No data yet</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add habits and start checking them off to see your weekly report.
        </p>
      </div>
    )
  }

  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => toISODate(subDays(today, i)))
  
  const habitStats = habits.map(h => {
    const habitCheckins = checkins.filter(c => c.habitId === h.id && last7Days.includes(c.date))
    return { ...h, count: habitCheckins.length }
  })

  const totalCheckins = habitStats.reduce((sum, h) => sum + h.count, 0)
  const totalPossible = habits.length * 7
  const overallPct = totalPossible === 0 ? 0 : Math.round((totalCheckins / totalPossible) * 100)
  
  const daysShowedUp = new Set(
    checkins.filter(c => last7Days.includes(c.date)).map(c => c.date)
  ).size

  const sortedByCount = [...habitStats].sort((a, b) => b.count - a.count)
  const best = sortedByCount[0]
  const worst = sortedByCount[sortedByCount.length - 1]

  // Generate Atomic Habits-style advice for the weakest habit
  let advice = ""
  const timesText = worst.count === 1 ? 'time' : 'times'
  
  if (worst.count === 0) {
    advice = `You missed "${worst.title}" entirely this week. Try the 2-minute rule: shrink it until it's impossible to fail, then just show up.`
  } else if (worst.count < 4) {
    advice = `You did "${worst.title}" ${worst.count} ${timesText}. Make it obvious: put a visual cue where you'll see it, and stack it after an existing habit.`
  } else {
    advice = `You did "${worst.title}" ${worst.count} ${timesText}. It's becoming a habit — keep the momentum going!`
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Weekly Report</h2>

      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-5 shadow-sm">
        <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Last 7 Days</p>
        <p className="text-2xl font-bold mt-1">You showed up {daysShowedUp} of 7 days.</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-indigo-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="text-sm font-medium tabular-nums">{overallPct}%</span>
        </div>
        <p className="text-xs text-indigo-100 mt-2">
          {totalCheckins} total check-ins out of {totalPossible} possible.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
          <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5">
            🌟 The Good
          </h3>
          <p className="text-sm text-emerald-900 mt-1">
            Your strongest habit was <strong>"{best.title}"</strong> ({best.count}/7 days).
            {best.count >= 5 && " You're crushing it!"}
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
            💡 The Opportunity
          </h3>
          <p className="text-sm text-amber-900 mt-1 leading-relaxed">
            {advice}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 text-sm mb-3">Habit Breakdown</h3>
        <div className="space-y-4">
          {habitStats.map(h => (
            <div key={h.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-700 truncate pr-2">{h.title}</span>
                <span className="text-xs font-medium text-slate-500 tabular-nums">{h.count}/7</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={
                    "h-full rounded-full transition-all " + 
                    (h.count === 7 ? "bg-emerald-500" : h.count === 0 ? "bg-slate-300" : "bg-indigo-400")
                  }
                  style={{ width: `${(h.count / 7) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}