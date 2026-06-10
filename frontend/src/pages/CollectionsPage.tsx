import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Folder, Plus, Trash2 } from 'lucide-react'
import { collectionsApi } from '../api'
import RequestBuilder from '../components/RequestBuilder'
import { useRequestStore } from '../stores/requestStore'
import type { ApiRequest } from '../types'

export default function CollectionsPage() {
  const queryClient = useQueryClient()
  const { loadRequest, resetRequest } = useRequestStore()
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => (await collectionsApi.list()).data,
  })

  const { data: tree } = useQuery({
    queryKey: ['collection-tree', selectedCollectionId],
    queryFn: async () =>
      selectedCollectionId
        ? (await collectionsApi.getTree(selectedCollectionId)).data
        : null,
    enabled: !!selectedCollectionId,
  })

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return
    await collectionsApi.create({ name: newCollectionName })
    setNewCollectionName('')
    setShowNewForm(false)
    queryClient.invalidateQueries({ queryKey: ['collections'] })
  }

  const handleDeleteCollection = async (id: number) => {
    if (!confirm('Delete this collection?')) return
    await collectionsApi.delete(id)
    if (selectedCollectionId === id) setSelectedCollectionId(null)
    queryClient.invalidateQueries({ queryKey: ['collections'] })
  }

  const handleSelectRequest = (request: ApiRequest) => {
    loadRequest(request)
  }

  const handleNewRequest = () => {
    resetRequest()
    if (selectedCollectionId) {
      loadRequest({
        name: 'New Request',
        method: 'GET',
        url: '',
        headers: {},
        query_params: {},
        body_type: 'none',
        body: null,
        auth_type: 'none',
        auth_config: {},
        collection_id: selectedCollectionId,
      })
    }
  }

  const requestsByFolder = (folderId: number | null) =>
    tree?.requests.filter((r) => r.folder_id === folderId) ?? []

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-slate-800 bg-slate-900/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Collections</h2>
          <button
            onClick={() => setShowNewForm(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showNewForm && (
          <div className="mb-3 space-y-2">
            <input
              className="input-field text-sm"
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
            />
            <div className="flex gap-2">
              <button onClick={handleCreateCollection} className="btn-primary flex-1 text-xs">
                Create
              </button>
              <button onClick={() => setShowNewForm(false)} className="btn-secondary flex-1 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {collections.map((col) => (
            <div key={col.id} className="group flex items-center">
              <button
                onClick={() => setSelectedCollectionId(col.id)}
                className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedCollectionId === col.id
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ChevronRight className="h-3 w-3" />
                {col.name}
              </button>
              <button
                onClick={() => handleDeleteCollection(col.id)}
                className="hidden rounded p-1 text-slate-500 group-hover:block hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {selectedCollectionId && tree && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-slate-500">Tree</span>
              <button onClick={handleNewRequest} className="text-xs text-brand-400">
                + Request
              </button>
            </div>
            {tree.folders.map((folder) => (
              <div key={folder.id} className="mb-2">
                <div className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400">
                  <Folder className="h-3 w-3" />
                  {folder.name}
                </div>
                {requestsByFolder(folder.id).map((req) => (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className="block w-full truncate rounded px-4 py-1 text-left font-mono text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                  >
                    {req.method} {req.name}
                  </button>
                ))}
              </div>
            ))}
            {requestsByFolder(null).map((req) => (
              <button
                key={req.id}
                onClick={() => handleSelectRequest(req)}
                className="block w-full truncate rounded px-2 py-1 text-left font-mono text-xs text-slate-500 hover:bg-slate-800"
              >
                {req.method} {req.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {selectedCollectionId ? (
          <RequestBuilder
            collectionId={selectedCollectionId}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ['collection-tree', selectedCollectionId] })
              queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            }}
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">
            Select a collection to view and edit requests
          </div>
        )}
      </div>
    </div>
  )
}
