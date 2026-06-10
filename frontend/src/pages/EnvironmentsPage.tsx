import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { environmentsApi } from '../api'
import KeyValueEditor from '../components/KeyValueEditor'

export default function EnvironmentsPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editVars, setEditVars] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', is_global: true, variables: {} as Record<string, string> })

  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: async () => (await environmentsApi.list()).data,
  })

  const handleCreate = async () => {
    if (!form.name.trim()) return
    await environmentsApi.create(form)
    setForm({ name: '', is_global: true, variables: {} })
    queryClient.invalidateQueries({ queryKey: ['environments'] })
  }

  const startEdit = (id: number, variables: Record<string, string>) => {
    setEditingId(id)
    setEditVars({ ...variables })
  }

  const handleUpdate = async (id: number) => {
    const env = environments.find((e) => e.id === id)
    if (!env) return
    await environmentsApi.update(id, {
      name: env.name,
      variables: editVars,
      is_global: env.is_global,
    })
    setEditingId(null)
    queryClient.invalidateQueries({ queryKey: ['environments'] })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete environment?')) return
    await environmentsApi.delete(id)
    queryClient.invalidateQueries({ queryKey: ['environments'] })
  }

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="mb-1 text-xl font-semibold text-pm-text">Environments</h1>
      <p className="mb-6 text-sm text-pm-muted">
        Use <code className="rounded bg-pm-hover px-1.5 py-0.5 font-mono text-pm-orange">{'{{variable}}'}</code>{' '}
        in URLs, headers, and body. Select an environment from the top bar when sending requests.
      </p>

      <div className="mb-6 rounded-lg border border-pm-border bg-pm-sidebar p-5">
        <h2 className="mb-4 text-sm font-semibold text-pm-text">Create Environment</h2>
        <div className="mb-4 flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Environment name (e.g. Development)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="flex items-center gap-2 whitespace-nowrap text-sm text-pm-muted">
            <input
              type="checkbox"
              checked={form.is_global}
              onChange={(e) => setForm({ ...form, is_global: e.target.checked })}
              className="accent-pm-orange"
            />
            Global
          </label>
        </div>
        <KeyValueEditor
          pairs={form.variables}
          onChange={(variables) => setForm({ ...form, variables })}
          keyPlaceholder="base_url"
          valuePlaceholder="https://api.example.com"
        />
        <button onClick={handleCreate} className="btn-send mt-4 gap-2">
          <Plus className="h-4 w-4" />
          Create Environment
        </button>
      </div>

      <div className="space-y-4">
        {environments.map((env) => (
          <div key={env.id} className="rounded-lg border border-pm-border bg-pm-sidebar p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-pm-text">{env.name}</h3>
                <span className="text-xs text-pm-muted">
                  {env.is_global ? 'Global' : 'Collection'} · {Object.keys(env.variables).length}{' '}
                  variables
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    editingId === env.id ? setEditingId(null) : startEdit(env.id, env.variables)
                  }
                  className="btn-secondary text-xs"
                >
                  {editingId === env.id ? 'Cancel' : 'Edit'}
                </button>
                <button onClick={() => handleDelete(env.id)} className="btn-ghost text-method-delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {editingId === env.id ? (
              <>
                <KeyValueEditor pairs={editVars} onChange={setEditVars} />
                <button onClick={() => handleUpdate(env.id)} className="btn-send mt-3 text-xs">
                  Save changes
                </button>
              </>
            ) : (
              <div className="rounded border border-pm-border bg-pm-panel p-3 font-mono text-xs">
                {Object.entries(env.variables).map(([k, v]) => (
                  <div key={k} className="py-0.5">
                    <span className="text-method-get">{k}</span>
                    <span className="text-pm-muted"> = </span>
                    <span className="text-pm-text">{v}</span>
                  </div>
                ))}
                {Object.keys(env.variables).length === 0 && (
                  <span className="text-pm-muted">No variables defined</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
