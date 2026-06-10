import { useQuery } from '@tanstack/react-query'
import { FolderTree, Send, Activity } from 'lucide-react'
import { dashboardApi } from '../api'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await dashboardApi.getStats()).data,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  const cards = [
    { label: 'Collections', value: stats?.total_collections ?? 0, icon: FolderTree, color: 'text-brand-400' },
    { label: 'Requests', value: stats?.total_requests ?? 0, icon: Send, color: 'text-emerald-400' },
    { label: 'Recent Activity', value: stats?.recent_activity.length ?? 0, icon: Activity, color: 'text-amber-400' },
  ]

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`rounded-lg bg-slate-800 p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
        {stats?.recent_activity.length === 0 ? (
          <p className="text-slate-500">No recent requests. Send your first API request!</p>
        ) : (
          <div className="space-y-2">
            {stats?.recent_activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs text-brand-300">
                    {entry.method}
                  </span>
                  <span className="truncate font-mono text-sm text-slate-300">{entry.url}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span
                    className={
                      entry.status_code && entry.status_code < 400
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }
                  >
                    {entry.status_code ?? '—'}
                  </span>
                  <span>{entry.response_time_ms}ms</span>
                  <span>{new Date(entry.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot placeholder */}
      <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-slate-500">
        [Screenshot: Dashboard overview]
      </div>
    </div>
  )
}
