import { useState } from 'react'
import { Save } from 'lucide-react'
import KeyValueEditor from './KeyValueEditor'
import ResponseViewer from './ResponseViewer'
import { executeApi, requestsApi } from '../api'
import { useRequestStore } from '../stores/requestStore'
import { getMethodColor } from '../utils/methodColors'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const BODY_TYPES = ['none', 'json', 'text', 'form', 'x-www-form-urlencoded']
const AUTH_TYPES = ['none', 'bearer', 'basic', 'api_key']
const ASSERTION_TYPES = [
  { value: 'status_equals', label: 'Status equals' },
  { value: 'response_time_lt', label: 'Response time < (ms)' },
  { value: 'json_field_exists', label: 'JSON field exists' },
  { value: 'json_field_equals', label: 'JSON field equals' },
]

interface RequestBuilderProps {
  collectionId?: number
  onSaved?: () => void
}

export default function RequestBuilder({ collectionId, onSaved }: RequestBuilderProps) {
  const {
    currentRequest,
    setCurrentRequest,
    lastResponse,
    setLastResponse,
    selectedEnvironmentId,
    addAssertion,
    removeAssertion,
    updateAssertion,
  } = useRequestStore()

  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'tests'>('params')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    try {
      const { data } = await executeApi.run({
        method: currentRequest.method,
        url: currentRequest.url,
        headers: currentRequest.headers,
        query_params: currentRequest.query_params,
        body_type: currentRequest.body_type,
        body: currentRequest.body,
        auth_type: currentRequest.auth_type,
        auth_config: currentRequest.auth_config,
        environment_id: selectedEnvironmentId,
        collection_id: collectionId ?? currentRequest.collection_id,
        request_id: currentRequest.id,
        assertions: currentRequest.assertions || [],
        save_history: true,
      })
      setLastResponse(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setLastResponse({
        status_code: 0,
        response_time_ms: 0,
        headers: {},
        body: message,
        content_type: null,
        assertion_results: [],
        history_id: null,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!collectionId && !currentRequest.collection_id) return
    setSaving(true)
    try {
      const cid = collectionId ?? currentRequest.collection_id!
      if (currentRequest.id) {
        await requestsApi.update(currentRequest.id, currentRequest)
      } else {
        const { data } = await requestsApi.create(cid, currentRequest)
        setCurrentRequest({ id: data.id, collection_id: data.collection_id })
      }
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'params' as const, label: 'Params' },
    { id: 'auth' as const, label: 'Authorization' },
    { id: 'headers' as const, label: 'Headers' },
    { id: 'body' as const, label: 'Body' },
    { id: 'tests' as const, label: 'Tests' },
  ]

  const methodColor = getMethodColor(currentRequest.method)
  const canSave = !!(collectionId || currentRequest.collection_id)

  return (
    <div className="flex h-full flex-col">
      {/* Request tab bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-pm-border bg-pm-sidebar px-4 py-2">
        <input
          className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-pm-text outline-none placeholder-pm-muted"
          placeholder="Request name"
          value={currentRequest.name}
          onChange={(e) => setCurrentRequest({ name: e.target.value })}
        />
        {canSave && (
          <button onClick={handleSave} disabled={saving} className="btn-ghost text-xs">
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {/* URL bar — Postman style */}
      <div className="shrink-0 border-b border-pm-border bg-pm-bg px-4 py-3">
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="h-10 cursor-pointer appearance-none rounded-l border border-pm-border bg-pm-panel pl-3 pr-8 font-mono text-sm font-bold outline-none focus:border-pm-orange/60"
              style={{ color: methodColor }}
              value={currentRequest.method}
              onChange={(e) => setCurrentRequest({ method: e.target.value })}
            >
              {METHODS.map((m) => (
                <option key={m} value={m} style={{ color: getMethodColor(m) }}>
                  {m}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-pm-muted">
              ▾
            </div>
          </div>
          <input
            className="input-field flex-1 rounded-l-none font-mono text-sm"
            placeholder="Enter request URL — use {{variable}} for env vars"
            value={currentRequest.url}
            onChange={(e) => setCurrentRequest({ url: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} className="btn-send shrink-0">
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Request config + response split */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Request tabs & content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 border-b border-pm-border bg-pm-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pm-tab ${activeTab === tab.id ? 'pm-tab-active' : ''}`}
              >
                {tab.label}
                {tab.id === 'tests' && (currentRequest.assertions?.length ?? 0) > 0 && (
                  <span className="ml-1.5 rounded bg-pm-orange/20 px-1.5 text-xs text-pm-orange">
                    {currentRequest.assertions?.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {activeTab === 'params' && (
              <KeyValueEditor
                pairs={currentRequest.query_params}
                onChange={(query_params) => setCurrentRequest({ query_params })}
                keyPlaceholder="Query param"
                valuePlaceholder="Value"
              />
            )}

            {activeTab === 'headers' && (
              <KeyValueEditor
                pairs={currentRequest.headers}
                onChange={(headers) => setCurrentRequest({ headers })}
                keyPlaceholder="Header name"
                valuePlaceholder="Header value"
              />
            )}

            {activeTab === 'body' && (
              <div className="space-y-3">
                <select
                  className="input-field w-56"
                  value={currentRequest.body_type}
                  onChange={(e) => setCurrentRequest({ body_type: e.target.value })}
                >
                  {BODY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'none' ? 'none' : t}
                    </option>
                  ))}
                </select>
                {currentRequest.body_type !== 'none' && (
                  <textarea
                    className="input-field min-h-40 font-mono text-xs leading-relaxed"
                    placeholder={
                      currentRequest.body_type === 'json' ? '{\n  "key": "value"\n}' : 'Request body'
                    }
                    value={currentRequest.body || ''}
                    onChange={(e) => setCurrentRequest({ body: e.target.value })}
                  />
                )}
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="max-w-xl space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">
                    Auth Type
                  </label>
                  <select
                    className="input-field w-56"
                    value={currentRequest.auth_type}
                    onChange={(e) =>
                      setCurrentRequest({ auth_type: e.target.value, auth_config: {} })
                    }
                  >
                    {AUTH_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t === 'none'
                          ? 'No Auth'
                          : t === 'api_key'
                            ? 'API Key'
                            : t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {currentRequest.auth_type === 'bearer' && (
                  <input
                    className="input-field font-mono text-xs"
                    placeholder="Token or {{token}}"
                    value={currentRequest.auth_config.token || ''}
                    onChange={(e) =>
                      setCurrentRequest({ auth_config: { token: e.target.value } })
                    }
                  />
                )}
                {currentRequest.auth_type === 'basic' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="input-field"
                      placeholder="Username"
                      value={currentRequest.auth_config.username || ''}
                      onChange={(e) =>
                        setCurrentRequest({
                          auth_config: { ...currentRequest.auth_config, username: e.target.value },
                        })
                      }
                    />
                    <input
                      className="input-field"
                      type="password"
                      placeholder="Password"
                      value={currentRequest.auth_config.password || ''}
                      onChange={(e) =>
                        setCurrentRequest({
                          auth_config: { ...currentRequest.auth_config, password: e.target.value },
                        })
                      }
                    />
                  </div>
                )}
                {currentRequest.auth_type === 'api_key' && (
                  <div className="space-y-3">
                    <input
                      className="input-field"
                      placeholder="Key name (e.g. X-API-Key)"
                      value={currentRequest.auth_config.key_name || ''}
                      onChange={(e) =>
                        setCurrentRequest({
                          auth_config: { ...currentRequest.auth_config, key_name: e.target.value },
                        })
                      }
                    />
                    <input
                      className="input-field font-mono text-xs"
                      placeholder="Key value or {{api_key}}"
                      value={currentRequest.auth_config.key_value || ''}
                      onChange={(e) =>
                        setCurrentRequest({
                          auth_config: { ...currentRequest.auth_config, key_value: e.target.value },
                        })
                      }
                    />
                    <select
                      className="input-field w-48"
                      value={currentRequest.auth_config.location || 'header'}
                      onChange={(e) =>
                        setCurrentRequest({
                          auth_config: { ...currentRequest.auth_config, location: e.target.value },
                        })
                      }
                    >
                      <option value="header">Add to Header</option>
                      <option value="query">Add to Query Params</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-3">
                {(currentRequest.assertions || []).map((assertion, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 rounded border border-pm-border bg-pm-sidebar p-3"
                  >
                    <select
                      className="input-field w-52"
                      value={assertion.assertion_type}
                      onChange={(e) =>
                        updateAssertion(index, { ...assertion, assertion_type: e.target.value })
                      }
                    >
                      {ASSERTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    {(assertion.assertion_type === 'json_field_exists' ||
                      assertion.assertion_type === 'json_field_equals') && (
                      <input
                        className="input-field min-w-[160px] flex-1 font-mono text-xs"
                        placeholder="JSON path (e.g. data.id)"
                        value={assertion.target || ''}
                        onChange={(e) =>
                          updateAssertion(index, { ...assertion, target: e.target.value })
                        }
                      />
                    )}
                    <input
                      className="input-field w-36 font-mono text-xs"
                      placeholder="Expected value"
                      value={assertion.expected_value || ''}
                      onChange={(e) =>
                        updateAssertion(index, { ...assertion, expected_value: e.target.value })
                      }
                    />
                    <button
                      onClick={() => removeAssertion(index)}
                      className="btn-ghost text-method-delete hover:text-method-delete"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    addAssertion({ assertion_type: 'status_equals', expected_value: '200' })
                  }
                  className="text-sm text-pm-orange hover:text-pm-orange-hover"
                >
                  + Add test
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Response panel — bottom half like Postman */}
        <ResponseViewer response={lastResponse} loading={loading} />
      </div>
    </div>
  )
}
