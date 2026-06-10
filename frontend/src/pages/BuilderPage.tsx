import { useQuery } from '@tanstack/react-query'
import RequestBuilder from '../components/RequestBuilder'
import { environmentsApi } from '../api'
import { useRequestStore } from '../stores/requestStore'

export default function BuilderPage() {
  const { selectedEnvironmentId, setSelectedEnvironmentId } = useRequestStore()

  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: async () => (await environmentsApi.list()).data,
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Request Builder</h1>
        <select
          className="input-field w-56"
          value={selectedEnvironmentId ?? ''}
          onChange={(e) =>
            setSelectedEnvironmentId(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">No environment</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name} {env.is_global ? '(Global)' : ''}
            </option>
          ))}
        </select>
      </div>
      <RequestBuilder />
    </div>
  )
}
