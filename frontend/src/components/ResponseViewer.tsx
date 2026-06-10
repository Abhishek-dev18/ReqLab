import { useMemo, useState } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import type { ExecuteResponse } from '../types'
import { useRequestStore } from '../stores/requestStore'

interface ResponseViewerProps {
  response: ExecuteResponse | null
  loading?: boolean
}

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-method-post'
  if (code >= 400) return 'text-method-delete'
  return 'text-method-put'
}

export default function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const { responseView, setResponseView } = useRequestStore()
  const [panelTab, setPanelTab] = useState<'body' | 'headers'>('body')
  const [collapsed, setCollapsed] = useState(false)

  const formattedBody = useMemo(() => {
    if (!response?.body) return ''
    if (responseView === 'raw') return response.body
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2)
    } catch {
      return response.body
    }
  }, [response?.body, responseView])

  const passedCount = response?.assertion_results.filter((a) => a.passed).length ?? 0
  const totalAssertions = response?.assertion_results.length ?? 0

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-pm-border bg-pm-panel">
      {/* Response header bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-pm-border bg-pm-sidebar px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-pm-muted hover:text-pm-text"
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <span className="text-sm font-semibold text-pm-text">Response</span>
          {response && !loading && (
            <>
              <span className={`text-sm font-semibold ${statusColor(response.status_code)}`}>
                {response.status_code || 'Error'}
                {response.status_code >= 200 && response.status_code < 300 ? ' OK' : ''}
              </span>
              <span className="text-xs text-pm-muted">{response.response_time_ms} ms</span>
              <span className="text-xs text-pm-muted">
                {new Blob([response.body || '']).size} B
              </span>
              {totalAssertions > 0 && (
                <span
                  className={`text-xs ${passedCount === totalAssertions ? 'text-method-post' : 'text-method-delete'}`}
                >
                  Tests {passedCount}/{totalAssertions} passed
                </span>
              )}
            </>
          )}
          {loading && <span className="text-xs text-pm-muted">Sending...</span>}
        </div>

        {!collapsed && response && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPanelTab('body')}
              className={`pm-tab py-1.5 ${panelTab === 'body' ? 'pm-tab-active' : ''}`}
            >
              Body
            </button>
            <button
              onClick={() => setPanelTab('headers')}
              className={`pm-tab py-1.5 ${panelTab === 'headers' ? 'pm-tab-active' : ''}`}
            >
              Headers ({Object.keys(response.headers).length})
            </button>
            {panelTab === 'body' && (
              <div className="ml-2 flex rounded border border-pm-border p-0.5">
                {(['pretty', 'raw'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setResponseView(view)}
                    className={`rounded px-2 py-0.5 text-xs capitalize ${
                      responseView === view
                        ? 'bg-pm-orange text-white'
                        : 'text-pm-muted hover:text-pm-text'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="min-h-0 flex-1 overflow-auto">
          {loading ? (
            <div className="flex h-full min-h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-pm-orange border-t-transparent" />
            </div>
          ) : !response ? (
            <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-pm-muted">
              Click Send to get a response
            </div>
          ) : (
            <div className="h-full p-4">
              {response.assertion_results.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {response.assertion_results.map((result, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded border px-3 py-2 text-xs ${
                        result.passed
                          ? 'border-method-post/30 bg-method-post/10 text-method-post'
                          : 'border-method-delete/30 bg-method-delete/10 text-method-delete'
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                      )}
                      {result.message}
                    </div>
                  ))}
                </div>
              )}

              {panelTab === 'body' ? (
                <pre className="h-full min-h-[160px] overflow-auto rounded border border-pm-border bg-pm-bg p-4 font-mono text-xs leading-relaxed text-pm-text">
                  {formattedBody || '(empty body)'}
                </pre>
              ) : (
                <div className="overflow-auto rounded border border-pm-border bg-pm-bg p-3 font-mono text-xs">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="py-0.5">
                      <span className="text-method-get">{k}</span>
                      <span className="text-pm-muted">: </span>
                      <span className="text-pm-text">{v}</span>
                    </div>
                  ))}
                  {Object.keys(response.headers).length === 0 && (
                    <span className="text-pm-muted">No headers</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
