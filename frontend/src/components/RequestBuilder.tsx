import { useState } from 'react'
import { Play, Save } from 'lucide-react'
import KeyValueEditor from './KeyValueEditor'
import ResponseViewer from './ResponseViewer'
import { executeApi, requestsApi } from '../api'
import { useRequestStore } from '../stores/requestStore'

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

  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'assertions'>('params')
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
    { id: 'params' as const, label: 'Query Params' },
    { id: 'headers' as const, label: 'Headers' },
    { id: 'body' as const, label: 'Body' },
    { id: 'auth' as const, label: 'Auth' },
    { id: 'assertions' as const, label: 'Assertions' },
  ]

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <input
          className="input-field text-sm font-medium"
          placeholder="Request name"
          value={currentRequest.name}
          onChange={(e) => setCurrentRequest({ name: e.target.value })}
        />

        <div className="flex gap-2">
          <select
            className="input-field w-32 font-mono text-sm font-semibold"
            value={currentRequest.method}
            onChange={(e) => setCurrentRequest({ method: e.target.value })}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            className="input-field flex-1 font-mono text-sm"
            placeholder="https://api.example.com/{{path}}"
            value={currentRequest.url}
            onChange={(e) => setCurrentRequest({ url: e.target.value })}
          />
          <button onClick={handleSend} disabled={loading} className="btn-primary gap-2">
            <Play className="h-4 w-4" />
            Send
          </button>
          {(collectionId || currentRequest.collection_id) && (
            <button onClick={handleSave} disabled={saving} className="btn-secondary gap-2">
              <Save className="h-4 w-4" />
              Save
            </button>
          )}
        </div>

        <div className="flex gap-1 border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-brand-500 text-brand-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'params' && (
          <KeyValueEditor
            pairs={currentRequest.query_params}
            onChange={(query_params) => setCurrentRequest({ query_params })}
          />
        )}

        {activeTab === 'headers' && (
          <KeyValueEditor
            pairs={currentRequest.headers}
            onChange={(headers) => setCurrentRequest({ headers })}
          />
        )}

        {activeTab === 'body' && (
          <div className="space-y-3">
            <select
              className="input-field w-48"
              value={currentRequest.body_type}
              onChange={(e) => setCurrentRequest({ body_type: e.target.value })}
            >
              {BODY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {currentRequest.body_type !== 'none' && (
              <textarea
                className="input-field min-h-32 font-mono text-xs"
                placeholder={currentRequest.body_type === 'json' ? '{\n  "key": "value"\n}' : ''}
                value={currentRequest.body || ''}
                onChange={(e) => setCurrentRequest({ body: e.target.value })}
              />
            )}
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-3">
            <select
              className="input-field w-48"
              value={currentRequest.auth_type}
              onChange={(e) => setCurrentRequest({ auth_type: e.target.value, auth_config: {} })}
            >
              {AUTH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
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
              <div className="grid grid-cols-2 gap-2">
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
              <div className="space-y-2">
                <input
                  className="input-field"
                  placeholder="Key name"
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
                  <option value="header">Header</option>
                  <option value="query">Query</option>
                </select>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assertions' && (
          <div className="space-y-3">
            {(currentRequest.assertions || []).map((assertion, index) => (
              <div key={index} className="flex gap-2">
                <select
                  className="input-field w-48"
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
                    className="input-field flex-1 font-mono text-xs"
                    placeholder="data.field"
                    value={assertion.target || ''}
                    onChange={(e) =>
                      updateAssertion(index, { ...assertion, target: e.target.value })
                    }
                  />
                )}
                <input
                  className="input-field w-32 font-mono text-xs"
                  placeholder="Expected"
                  value={assertion.expected_value || ''}
                  onChange={(e) =>
                    updateAssertion(index, { ...assertion, expected_value: e.target.value })
                  }
                />
                <button
                  onClick={() => removeAssertion(index)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addAssertion({ assertion_type: 'status_equals', expected_value: '200' })
              }
              className="text-sm text-brand-400 hover:text-brand-300"
            >
              + Add assertion
            </button>
          </div>
        )}
      </div>

      <ResponseViewer response={lastResponse} loading={loading} />
    </div>
  )
}
