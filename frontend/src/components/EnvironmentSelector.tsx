import { useQuery } from '@tanstack/react-query'
import { environmentsApi } from '../api'
import { useRequestStore } from '../stores/requestStore'

export default function EnvironmentSelector() {
  const { selectedEnvironmentId, setSelectedEnvironmentId } = useRequestStore()

  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: async () => (await environmentsApi.list()).data,
  })

  return (
    <select
      className="rounded border border-pm-border bg-pm-panel px-3 py-1.5 text-sm text-pm-text outline-none focus:border-pm-orange/60"
      value={selectedEnvironmentId ?? ''}
      onChange={(e) => setSelectedEnvironmentId(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">No Environment</option>
      {environments.map((env) => (
        <option key={env.id} value={env.id}>
          {env.name}
          {env.is_global ? ' (Global)' : ''}
        </option>
      ))}
    </select>
  )
}
