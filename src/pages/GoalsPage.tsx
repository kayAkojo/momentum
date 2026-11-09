import { useState, type FormEvent } from 'react'
import { useGoals, useHabits, useAllCheckins } from '../db/hooks'
import { addGoal, addHabit } from '../db/actions'
import type { Goal } from '../db/types'

export function GoalsPage() {
  const goals = useGoals() ?? []
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = selectedId !== null ? goals.find((g) => g.id === selectedId) : undefined

  if (selected) {
    return <GoalDetail goal={selected} onBack={() => setSelectedId(null)} />
  }
  return <GoalsList goals={goals} onSelect={setSelectedId} />
}

function GoalsList({
  goals,
  onSelect,
}: {
  goals: Goal[]
  onSelect: (id: number) => void
}) {
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Your goals</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium"
          >
            + New
          </button>
        )}
      </div>

      {adding && (
        <AddGoalForm
          onCancel={() => setAdding(false)}
          onDone={() => setAdding(false)}
        />
      )}

      {goals.length === 0 && !adding && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm text-slate-500 mb-3">
            You haven't set a goal yet.
          </p>
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
          >
            Create your first goal
          </button>
        </div>
      )}

      {goals.map((g) => (
        <GoalCard key={g.id} goal={g} onClick={() => onSelect(g.id!)} />
      ))}
    </div>
  )
}

function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const habits = useHabits(goal.id) ?? []
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white border border-slate-200 p-4 hover:border-slate-300 active:bg-slate-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{goal.title}</p>
          {goal.why && (
            <p className="text-xs text-slate-500 mt-0.5 truncate italic">
              "{goal.why}"
            </p>
          )}
        </div>
        <span className="text-slate-400 text-xl leading-none">›</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
      </p>
    </button>
  )
}

function GoalDetail({ goal, onBack }: { goal: Goal; onBack: () => void }) {
  const habits = useHabits(goal.id) ?? []
  const allCheckins = useAllCheckins() ?? []
  const [adding, setAdding] = useState(false)

  const goalHabitIds = new Set(habits.map((h) => h.id!))
  const totalCheckins = allCheckins.filter((c) =>
    goalHabitIds.has(c.habitId),
  ).length

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700 -mt-1"
      >
        ← Back
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">{goal.title}</h2>
        {goal.why && (
          <p className="mt-1 text-sm text-slate-500 italic">"{goal.why}"</p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          {totalCheckins} total check-in{totalCheckins === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Habits</h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-indigo-600 font-medium"
          >
            + Add habit
          </button>
        )}
      </div>

      {adding && (
        <AddHabitForm goalId={goal.id!} onDone={() => setAdding(false)} />
      )}

      {habits.length === 0 && !adding && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500">No habits yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Start tiny — 2 minutes is fine.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {habits.map((h) => (
          <div
            key={h.id}
            className="rounded-2xl bg-white border border-slate-200 p-3"
          >
            <p className="text-sm font-medium text-slate-900">{h.title}</p>
            {h.cue && (
              <p className="text-xs text-slate-500 mt-0.5">Cue: {h.cue}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AddGoalForm({
  onCancel,
  onDone,
}: {
  onCancel: () => void
  onDone: () => void
}) {
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addGoal({ title: title.trim(), why: why.trim() || undefined })
    onDone()
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2"
    >
      <h3 className="font-semibold text-slate-900">New goal</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Run a 5K"
        autoFocus
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="text"
        value={why}
        onChange={(e) => setWhy(e.target.value)}
        placeholder="Why? e.g. 'I'm someone who moves daily'"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-300 py-2 text-sm text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-40"
        >
          Add goal
        </button>
      </div>
    </form>
  )
}

function AddHabitForm({
  goalId,
  onDone,
}: {
  goalId: number
  onDone: () => void
}) {
  const [title, setTitle] = useState('')
  const [cue, setCue] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addHabit({
      goalId,
      title: title.trim(),
      cue: cue.trim() || undefined,
    })
    onDone()
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Habit, e.g. Run 10 minutes"
        autoFocus
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="text"
        value={cue}
        onChange={(e) => setCue(e.target.value)}
        placeholder="Cue (optional), e.g. 'After I pour my coffee'"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-lg border border-slate-300 py-2 text-sm text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-40"
        >
          Add habit
        </button>
      </div>
    </form>
  )
}