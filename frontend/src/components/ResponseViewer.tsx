import { useMemo } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import type { ExecuteResponse } from '../types'
import { useRequestStore } from '../stores/requestStore'

interface ResponseViewerProps {
  response: ExecuteResponse | null
  loading?: boolean
}

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-emerald-400'
  if (code >= 400) return 'text-red-400'
  return 'text-amber-400'
}

export default function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const { responseView, setResponseView } = useRequestStore()

  const formattedBody = useMemo(() => {
    if (!response?.body) return ''
    if (responseView === 'raw') return response.body
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2)
    } catch {
      return response.body
    }
  }, [response?.body, responseView])

  if (loading) {
    return (
      <div className="card flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!response) {
    return (
      <div className="card flex h-64 items-center justify-center text-slate-500">
        Send a request to see the response
      </div>
    )
  }

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <span className="text-xs text-slate-500">Status</span>
          <p className={`text-lg font-semibold ${statusColor(response.status_code)}`}>
            {response.status_code || 'Error'}
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Time</span>
          <p className="text-lg font-semibold text-slate-200">{response.response_time_ms} ms</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Size</span>
          <p className="text-lg font-semibold text-slate-200">
            {new Blob([response.body]).size} B
          </p>
        </div>
      </div>

      {response.assertion_results.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Assertions</h4>
          {response.assertion_results.map((result, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                result.passed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
              }`}
            >
              {result.passed ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              {result.message}
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-300">Response Body</h4>
          <div className="flex rounded-lg border border-slate-700 p-0.5">
            {(['pretty', 'raw'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setResponseView(view)}
                className={`rounded-md px-3 py-1 text-xs capitalize ${
                  responseView === view ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-300">
          {formattedBody}
        </pre>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-300">Response Headers</h4>
        <div className="max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 font-mono text-xs">
          {Object.entries(response.headers).map(([k, v]) => (
            <div key={k} className="text-slate-400">
              <span className="text-brand-400">{k}</span>: {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
