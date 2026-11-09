import { useState } from 'react'
import { TodayPage } from './pages/TodayPage'
import { GoalsPage } from './pages/GoalsPage'
import { StatsPage } from './pages/StatsPage'
import { ReportPage } from './pages/ReportPage'
import { DevPanel } from './components/DevPanel'

type Tab = 'today' | 'goals' | 'stats' | 'report' | 'dev'

export default function App() {
  // This is true locally, false in production
  const isDev = import.meta.env.DEV
  const [tab, setTab] = useState<Tab>('today')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'today', label: 'Today', icon: '✅' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'report', label: 'Report', icon: '📝' },
    ...(isDev ? [{ id: 'dev' as const, label: 'Dev', icon: '🛠' }] : []),
  ]

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-md px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-900">Momentum</h1>
          <p className="text-xs text-slate-500">Small steps, every day.</p>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-md px-4 py-6 pb-24">
        {tab === 'today' && <TodayPage onGoToGoals={() => setTab('goals')} />}
        {tab === 'goals' && <GoalsPage />}
        {tab === 'stats' && <StatsPage />}
        {tab === 'report' && <ReportPage />}
        {tab === 'dev' && <DevPanel />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
        <div
          className={
            'mx-auto max-w-md grid ' + (isDev ? 'grid-cols-5' : 'grid-cols-4')
          }
        >
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  'flex flex-col items-center gap-0.5 py-2 transition-colors ' +
                  (active
                    ? 'text-indigo-600'
                    : 'text-slate-400 hover:text-slate-600')
                }
              >
                <span className="text-xl leading-none">{t.icon}</span>
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}