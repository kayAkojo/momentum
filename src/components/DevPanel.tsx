import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { useGoals, useHabits, useAllCheckins } from '../db/hooks'
import { addGoal, addHabit, toggleCheckin, clearAll } from '../db/actions'

export function DevPanel() {
  const goals = useGoals() ?? []
  const habits = useHabits() ?? []
  const checkins = useAllCheckins() ?? []
  const today = format(new Date(), 'yyyy-MM-dd')

  const checkedToday = new Set(
    checkins.filter((c) => c.date === today).map((c) => c.habitId),
  )

  const [goalTitle, setGoalTitle] = useState('')
  const [goalWhy, setGoalWhy] = useState('')
  const [habitTitle, setHabitTitle] = useState('')
  const [habitGoalId, setHabitGoalId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  async function onAddGoal(e: FormEvent) {
    e.preventDefault()
    if (!goalTitle.trim()) return
    try {
      await addGoal({ title: goalTitle.trim(), why: goalWhy.trim() || undefined })
      setGoalTitle('')
      setGoalWhy('')
    } catch (err) {
      setError(String(err))
    }
  }

  async function onAddHabit(e: FormEvent) {
    e.preventDefault()
    if (!habitTitle.trim() || !habitGoalId) return
    try {
      await addHabit({ goalId: Number(habitGoalId), title: habitTitle.trim() })
      setHabitTitle('')
    } catch (err) {
      setError(String(err))
    }
  }

  async function onClear() {
    if (!confirm('Delete ALL data? This cannot be undone.')) return
    await clearAll()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
        🛠 <strong>Dev tools</strong> — visible only in development (won't ship to Vercel). Replaced in Step 4.
      </div>

      <form
        onSubmit={onAddGoal}
        className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2"
      >
        <h3 className="font-semibold text-slate-900">Add a goal</h3>
        <input
          type="text"
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          placeholder="e.g. Run a 5K"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={goalWhy}
          onChange={(e) => setGoalWhy(e.target.value)}
          placeholder="Why? e.g. 'I'm someone who moves daily'"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!goalTitle.trim()}
          className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-40"
        >
          Add goal
        </button>
      </form>

      <form
        onSubmit={onAddHabit}
        className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2"
      >
        <h3 className="font-semibold text-slate-900">Add a habit to a goal</h3>
        <select
          value={habitGoalId}
          onChange={(e) =>
            setHabitGoalId(e.target.value === '' ? '' : Number(e.target.value))
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Pick a goal…</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={habitTitle}
          onChange={(e) => setHabitTitle(e.target.value)}
          placeholder="e.g. Run 10 minutes"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!habitTitle.trim() || !habitGoalId}
          className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-40"
        >
          Add habit
        </button>
      </form>

      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
        <h3 className="font-semibold text-slate-900">Your data</h3>
        <p className="text-xs text-slate-500">
          Goals: {goals.length} · Habits: {habits.length} · Check-ins today:{' '}
          {checkedToday.size} · Total check-ins: {checkins.length}
        </p>
        {goals.length === 0 && (
          <p className="text-sm text-slate-500">No goals yet. Add one above.</p>
        )}
        {goals.map((g) => {
          const goalHabits = habits.filter((h) => h.goalId === g.id)
          return (
            <div key={g.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{g.title}</p>
              {g.why && <p className="text-xs text-slate-500">{g.why}</p>}
              <ul className="mt-2 space-y-1">
                {goalHabits.length === 0 && (
                  <li className="text-xs text-slate-400">No habits yet.</li>
                )}
                {goalHabits.map((h) => {
                  const done = checkedToday.has(h.id!)
                  return (
                    <li
                      key={h.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className={
                          done ? 'line-through text-slate-400' : 'text-slate-700'
                        }
                      >
                        {h.title}
                      </span>
                      <button
                        onClick={() => toggleCheckin(h.id!, today)}
                        className={
                          'rounded-md px-2 py-1 text-xs font-medium ' +
                          (done
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                        }
                      >
                        {done ? '✓ today' : 'check in'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Danger zone</h3>
        <p className="text-xs text-slate-500 mt-1 mb-2">Delete everything (for testing).</p>
        <button
          onClick={onClear}
          className="rounded-lg bg-rose-600 text-white px-3 py-2 text-sm font-medium"
        >
          Clear all data
        </button>
      </div>

      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
        ✅ <strong>Persistence check:</strong> Add data above, then refresh the page. If it's still there, IndexedDB is working.
      </div>
    </div>
  )
}