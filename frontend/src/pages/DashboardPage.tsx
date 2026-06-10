import { useQuery } from '@tanstack/react-query'
import { Activity, FolderTree, Send } from 'lucide-react'
import { dashboardApi } from '../api'
import { getMethodBgClass } from '../utils/methodColors'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await dashboardApi.getStats()).data,
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pm-orange border-t-transparent" />
      </div>
    )
  }

  const cards = [
    { label: 'Collections', value: stats?.total_collections ?? 0, icon: FolderTree },
    { label: 'Requests', value: stats?.total_requests ?? 0, icon: Send },
    { label: 'Recent Runs', value: stats?.recent_activity.length ?? 0, icon: Activity },
  ]

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="mb-1 text-xl font-semibold text-pm-text">Dashboard</h1>
      <p className="mb-6 text-sm text-pm-muted">Overview of your ReqLab workspace</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-lg border border-pm-border bg-pm-sidebar p-5"
          >
            <div className="rounded-lg bg-pm-hover p-3 text-pm-orange">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-pm-muted">{label}</p>
              <p className="text-2xl font-bold text-pm-text">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-pm-border bg-pm-sidebar">
        <div className="border-b border-pm-border px-5 py-3">
          <h2 className="text-sm font-semibold text-pm-text">Recent Activity</h2>
        </div>
        {stats?.recent_activity.length === 0 ? (
          <p className="p-5 text-sm text-pm-muted">No recent requests. Send your first API request!</p>
        ) : (
          <div className="divide-y divide-pm-border">
            {stats?.recent_activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-pm-hover/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`shrink-0 rounded border px-1.5 font-mono text-[10px] font-bold ${getMethodBgClass(entry.method)}`}
                  >
                    {entry.method}
                  </span>
                  <span className="truncate font-mono text-xs text-pm-text">{entry.url}</span>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs text-pm-muted">
                  <span
                    className={
                      entry.status_code && entry.status_code < 400
                        ? 'text-method-post'
                        : 'text-method-delete'
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
    </div>
  )
}
