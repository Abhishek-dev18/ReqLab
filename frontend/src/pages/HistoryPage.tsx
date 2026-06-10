import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { historyApi } from '../api'
import { getMethodBgClass } from '../utils/methodColors'

export default function HistoryPage() {
  const queryClient = useQueryClient()

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => (await historyApi.list()).data,
  })

  const handleDelete = async (id: number) => {
    await historyApi.delete(id)
    queryClient.invalidateQueries({ queryKey: ['history'] })
  }

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="mb-1 text-xl font-semibold text-pm-text">History</h1>
      <p className="mb-6 text-sm text-pm-muted">Past request executions</p>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-pm-orange border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-lg border border-pm-border bg-pm-sidebar p-8 text-center text-sm text-pm-muted">
          No request history yet. Send a request from Collections to see it here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-pm-border">
          <table className="w-full text-sm">
            <thead className="border-b border-pm-border bg-pm-sidebar">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-pm-muted">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-pm-muted">
                  URL
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-pm-muted">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-pm-muted">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-pm-muted">
                  Timestamp
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="bg-pm-panel">
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-pm-border/50 hover:bg-pm-hover/20">
                  <td className="px-4 py-3">
                    <span
                      className={`rounded border px-1.5 font-mono text-[10px] font-bold ${getMethodBgClass(entry.method)}`}
                    >
                      {entry.method}
                    </span>
                  </td>
                  <td className="max-w-md truncate px-4 py-3 font-mono text-xs text-pm-text">
                    {entry.url}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        entry.status_code && entry.status_code < 400
                          ? 'text-method-post'
                          : 'text-method-delete'
                      }
                    >
                      {entry.status_code ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-pm-muted">{entry.response_time_ms}ms</td>
                  <td className="px-4 py-3 text-xs text-pm-muted">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-pm-muted hover:text-method-delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
