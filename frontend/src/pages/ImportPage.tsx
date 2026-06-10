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
    <div className="h-full overflow-auto p-6">
      <h1 className="mb-1 text-xl font-semibold text-pm-text">Import OpenAPI</h1>
      <p className="mb-6 text-sm text-pm-muted">
        Import OpenAPI 3.x JSON or YAML to automatically create collections, folders, and requests.
      </p>

      <div className="max-w-3xl space-y-4 rounded-lg border border-pm-border bg-pm-sidebar p-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">
            Collection name (optional)
          </label>
          <input
            className="input-field"
            placeholder="Override name from spec"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">
            Upload file
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-pm-border px-4 py-8 text-pm-muted transition hover:border-pm-orange hover:text-pm-orange">
            <Upload className="h-6 w-6" />
            <span className="text-sm">Click to upload JSON or YAML</span>
            <input type="file" accept=".json,.yaml,.yml" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase text-pm-muted">
            Or paste specification
          </label>
          <textarea
            className="input-field min-h-64 font-mono text-xs leading-relaxed"
            placeholder="openapi: 3.0.0..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded border border-method-delete/30 bg-method-delete/10 px-3 py-2 text-sm text-method-delete">
            {error}
          </p>
        )}
        {result && (
          <p className="rounded border border-method-post/30 bg-method-post/10 px-3 py-2 text-sm text-method-post">
            {result}
          </p>
        )}

        <button onClick={handleImport} disabled={loading} className="btn-send">
          {loading ? 'Importing...' : 'Import OpenAPI Spec'}
        </button>
      </div>
    </div>
  )
}
