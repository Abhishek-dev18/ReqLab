import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { historyApi } from '../api'

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
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Request History</h1>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <p className="text-slate-500">No request history yet.</p>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-slate-400">Method</th>
                <th className="px-4 py-3 text-left text-slate-400">URL</th>
                <th className="px-4 py-3 text-left text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-slate-400">Time</th>
                <th className="px-4 py-3 text-left text-slate-400">Timestamp</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs text-brand-300">
                      {entry.method}
                    </span>
                  </td>
                  <td className="max-w-md truncate px-4 py-3 font-mono text-slate-300">{entry.url}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        entry.status_code && entry.status_code < 400
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }
                    >
                      {entry.status_code ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{entry.response_time_ms}ms</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-slate-500 hover:text-red-400"
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
