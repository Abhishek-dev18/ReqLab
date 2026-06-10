import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { environmentsApi } from '../api'
import KeyValueEditor from '../components/KeyValueEditor'

export default function EnvironmentsPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
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

  const handleUpdate = async (id: number) => {
    const env = environments.find((e) => e.id === id)
    if (!env) return
    await environmentsApi.update(id, {
      name: env.name,
      variables: env.variables,
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
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Environments</h1>
      <p className="mb-6 text-slate-400">
        Use <code className="text-brand-400">{'{{variable_name}}'}</code> in URLs, headers, and body.
      </p>

      <div className="card mb-6 space-y-4">
        <h2 className="font-semibold">Create Environment</h2>
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Environment name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={form.is_global}
              onChange={(e) => setForm({ ...form, is_global: e.target.checked })}
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
        <button onClick={handleCreate} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      <div className="space-y-4">
        {environments.map((env) => (
          <div key={env.id} className="card">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{env.name}</h3>
                <span className="text-xs text-slate-500">
                  {env.is_global ? 'Global' : 'Collection'} environment
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === env.id ? null : env.id)}
                  className="btn-secondary text-xs"
                >
                  {editingId === env.id ? 'Done' : 'Edit'}
                </button>
                <button onClick={() => handleDelete(env.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {editingId === env.id ? (
              <KeyValueEditor
                pairs={env.variables}
                onChange={(variables) => {
                  env.variables = variables
                }}
              />
            ) : (
              <div className="font-mono text-xs text-slate-400">
                {Object.entries(env.variables).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-brand-400">{k}</span> = {v}
                  </div>
                ))}
                {Object.keys(env.variables).length === 0 && 'No variables'}
              </div>
            )}
            {editingId === env.id && (
              <button onClick={() => handleUpdate(env.id)} className="btn-primary mt-3 text-xs">
                Save changes
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
