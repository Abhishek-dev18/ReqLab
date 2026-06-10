import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { openApiApi } from '../api'

export default function ImportPage() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setContent(reader.result as string)
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!content.trim()) {
      setError('Please paste or upload an OpenAPI specification')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await openApiApi.import({
        content,
        collection_name: collectionName || undefined,
      })
      setResult(
        `Imported "${data.title}" — ${data.requests_created} requests in ${data.folders_created} folders`,
      )
      setTimeout(() => navigate('/collections'), 2000)
    } catch {
      setError('Failed to import. Ensure the spec is valid OpenAPI 3.x JSON or YAML.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-white">OpenAPI Import</h1>
      <p className="mb-6 text-slate-400">
        Import OpenAPI 3.x JSON or YAML to automatically create collections, folders, and requests.
      </p>

      <div className="card max-w-3xl space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Collection name (optional)</label>
          <input
            className="input-field"
            placeholder="Override name from spec"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Upload file</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-700 px-4 py-6 text-slate-400 hover:border-brand-500 hover:text-brand-400">
            <Upload className="h-5 w-5" />
            <span>Click to upload JSON or YAML</span>
            <input type="file" accept=".json,.yaml,.yml" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Or paste specification</label>
          <textarea
            className="input-field min-h-64 font-mono text-xs"
            placeholder="openapi: 3.0.0..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {result && <p className="text-sm text-emerald-400">{result}</p>}

        <button onClick={handleImport} disabled={loading} className="btn-primary">
          {loading ? 'Importing...' : 'Import OpenAPI Spec'}
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-slate-500">
        [Screenshot: OpenAPI import result]
      </div>
    </div>
  )
}
