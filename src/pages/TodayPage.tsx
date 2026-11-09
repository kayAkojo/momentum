import { useGoals, useHabits, useCheckinsForDate } from '../db/hooks'
import { toggleCheckin } from '../db/actions'
import { todayISO, formatDateNice } from '../utils/dates'

export function TodayPage({ onGoToGoals }: { onGoToGoals: () => void }) {
  const today = todayISO()
  const goals = useGoals() ?? []
  const habits = useHabits() ?? []
  const checkins = useCheckinsForDate(today) ?? []

  const checkedSet = new Set(checkins.map((c) => c.habitId))
  const total = habits.length
  const done = habits.filter((h) => checkedSet.has(h.id!)).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const allDone = total > 0 && done === total

  if (goals.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
        <div className="text-4xl mb-3">🎯</div>
        <h2 className="text-base font-semibold text-slate-900">No goals yet</h2>
        <p className="mt-1 text-sm text-slate-500 mb-4">
          Create a goal and break it into small daily habits first.
        </p>
        <button
          onClick={onGoToGoals}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
        >
          Go to Goals
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-500">{formatDateNice(today)}</p>
        <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
          {allDone ? 'Perfect day. 🎉' : 'Today'}
        </h2>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-slate-700">
            {done} of {total} done
          </span>
          <span className="text-slate-500">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={
              'h-full transition-all duration-300 ' +
              (allDone ? 'bg-emerald-500' : 'bg-indigo-500')
            }
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {goals.map((goal) => {
        const goalHabits = habits.filter((h) => h.goalId === goal.id)
        if (goalHabits.length === 0) return null
        return (
          <div
            key={goal.id}
            className="rounded-2xl bg-white border border-slate-200 p-4"
          >
            <h3 className="font-semibold text-slate-900">{goal.title}</h3>
            {goal.why && (
              <p className="text-xs text-slate-500 mt-0.5">{goal.why}</p>
            )}
            <ul className="mt-2 space-y-0.5">
              {goalHabits.map((h) => {
                const isDone = checkedSet.has(h.id!)
                return (
                  <li key={h.id}>
                    <button
                      onClick={() => toggleCheckin(h.id!, today)}
                      className="w-full flex items-center gap-3 rounded-xl px-1 py-2.5 hover:bg-slate-50 active:bg-slate-100 text-left"
                    >
                      <span
                        className={
                          'flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 text-xs font-bold transition-colors ' +
                          (isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 text-transparent')
                        }
                      >
                        ✓
                      </span>
                      <span
                        className={
                          'text-sm flex-1 ' +
                          (isDone
                            ? 'text-slate-400 line-through'
                            : 'text-slate-700')
                        }
                      >
                        {h.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      {habits.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500">
            Your goals have no habits yet. Add some in the Goals tab.
          </p>
          <button
            onClick={onGoToGoals}
            className="mt-3 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
          >
            Go to Goals
          </button>
        </div>
      )}

      {allDone && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
          <p className="text-sm text-emerald-800 font-medium">
            You showed up today. That's the identity. 💪
          </p>
        </div>
      )}
    </div>
  )
}