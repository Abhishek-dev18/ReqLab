import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Folder, Plus, Search, Trash2 } from 'lucide-react'
import { collectionsApi } from '../api'
import RequestBuilder from '../components/RequestBuilder'
import { useRequestStore } from '../stores/requestStore'
import { getMethodBgClass } from '../utils/methodColors'
import type { ApiRequest } from '../types'

export default function CollectionsPage() {
  const queryClient = useQueryClient()
  const { loadRequest, resetRequest, currentRequest } = useRequestStore()
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set())

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => (await collectionsApi.list()).data,
  })

  const { data: tree } = useQuery({
    queryKey: ['collection-tree', selectedCollectionId],
    queryFn: async () =>
      selectedCollectionId ? (await collectionsApi.getTree(selectedCollectionId)).data : null,
    enabled: !!selectedCollectionId,
  })

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return
    const { data } = await collectionsApi.create({ name: newCollectionName })
    setNewCollectionName('')
    setShowNewForm(false)
    setSelectedCollectionId(data.id)
    setExpandedCollections((prev) => new Set(prev).add(data.id))
    queryClient.invalidateQueries({ queryKey: ['collections'] })
  }

  const handleDeleteCollection = async (id: number) => {
    if (!confirm('Delete this collection and all its requests?')) return
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
        name: 'Untitled Request',
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

  const toggleFolder = (id: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleCollection = (id: number) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        if (selectedCollectionId === id) setSelectedCollectionId(null)
      } else {
        next.add(id)
        setSelectedCollectionId(id)
      }
      return next
    })
  }

  useEffect(() => {
    if (tree?.folders) {
      setExpandedFolders(new Set(tree.folders.map((f) => f.id)))
    }
  }, [tree])

  const requestsByFolder = (folderId: number | null) =>
    tree?.requests.filter((r) => r.folder_id === folderId) ?? []

  return (
    <div className="flex h-full">
      {/* Collections sidebar — Postman-style */}
      <div className="flex w-72 shrink-0 flex-col border-r border-pm-border bg-pm-sidebar">
        <div className="border-b border-pm-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-pm-muted">
              Collections
            </span>
            <button
              onClick={() => setShowNewForm(true)}
              title="New collection"
              className="rounded p-1 text-pm-muted hover:bg-pm-hover hover:text-pm-orange"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pm-muted" />
            <input
              className="input-field py-1.5 pl-8 text-xs"
              placeholder="Search collections"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {showNewForm && (
          <div className="space-y-2 border-b border-pm-border p-3">
            <input
              className="input-field text-xs"
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleCreateCollection} className="btn-send flex-1 py-1.5 text-xs">
                Create
              </button>
              <button onClick={() => setShowNewForm(false)} className="btn-secondary flex-1 py-1.5 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filteredCollections.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-pm-muted">
              No collections yet. Create one to get started.
            </p>
          ) : (
            filteredCollections.map((col) => (
              <div key={col.id} className="mb-0.5">
                <div className="group flex items-center rounded hover:bg-pm-hover">
                  <button
                    onClick={() => toggleCollection(col.id)}
                    className="flex flex-1 items-center gap-1 px-2 py-1.5 text-left text-sm text-pm-text"
                  >
                    {expandedCollections.has(col.id) ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-pm-muted" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-pm-muted" />
                    )}
                    <span className="truncate font-medium">{col.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(col.id)}
                    className="hidden rounded p-1 text-pm-muted group-hover:block hover:text-method-delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {expandedCollections.has(col.id) && selectedCollectionId === col.id && tree && (
                  <div className="ml-3 border-l border-pm-border pl-2">
                    <button
                      onClick={handleNewRequest}
                      className="mb-1 flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs text-pm-orange hover:bg-pm-hover"
                    >
                      <Plus className="h-3 w-3" />
                      Add request
                    </button>
                    {tree.folders.map((folder) => (
                      <div key={folder.id}>
                        <button
                          onClick={() => toggleFolder(folder.id)}
                          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs text-pm-muted hover:bg-pm-hover hover:text-pm-text"
                        >
                          {expandedFolders.has(folder.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          <Folder className="h-3 w-3 text-method-put" />
                          <span className="truncate">{folder.name}</span>
                        </button>
                        {expandedFolders.has(folder.id) &&
                          requestsByFolder(folder.id).map((req) => (
                            <button
                              key={req.id}
                              onClick={() => handleSelectRequest(req)}
                              className={`ml-4 flex w-full items-center gap-2 truncate rounded px-2 py-1 text-left text-xs hover:bg-pm-hover ${
                                currentRequest.id === req.id ? 'bg-pm-hover text-pm-text' : 'text-pm-muted'
                              }`}
                            >
                              <span
                                className={`shrink-0 rounded border px-1 font-mono text-[10px] font-bold ${getMethodBgClass(req.method)}`}
                              >
                                {req.method}
                              </span>
                              <span className="truncate">{req.name}</span>
                            </button>
                          ))}
                      </div>
                    ))}
                    {requestsByFolder(null).map((req) => (
                      <button
                        key={req.id}
                        onClick={() => handleSelectRequest(req)}
                        className={`flex w-full items-center gap-2 truncate rounded px-2 py-1 text-left text-xs hover:bg-pm-hover ${
                          currentRequest.id === req.id ? 'bg-pm-hover text-pm-text' : 'text-pm-muted'
                        }`}
                      >
                        <span
                          className={`shrink-0 rounded border px-1 font-mono text-[10px] font-bold ${getMethodBgClass(req.method)}`}
                        >
                          {req.method}
                        </span>
                        <span className="truncate">{req.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main request workspace */}
      <div className="min-w-0 flex-1">
        {selectedCollectionId ? (
          <RequestBuilder
            collectionId={selectedCollectionId}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ['collection-tree', selectedCollectionId] })
              queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-pm-muted">
            <Folder className="h-12 w-12 opacity-30" />
            <p className="text-sm">Select or create a collection to start building requests</p>
            <button onClick={() => setShowNewForm(true)} className="btn-send text-sm">
              Create Collection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
