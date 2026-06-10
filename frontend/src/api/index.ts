import { api } from './client'
import type {
  ApiRequest,
  Collection,
  CollectionTree,
  DashboardStats,
  Environment,
  ExecuteResponse,
  HistoryEntry,
  OpenApiImportResult,
  TokenResponse,
  User,
} from '../types'

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post<User>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard'),
}

export const collectionsApi = {
  list: () => api.get<Collection[]>('/collections'),
  get: (id: number) => api.get<Collection>(`/collections/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post<Collection>('/collections', data),
  update: (id: number, data: Partial<Collection>) =>
    api.put<Collection>(`/collections/${id}`, data),
  delete: (id: number) => api.delete(`/collections/${id}`),
  getTree: (id: number) => api.get<CollectionTree>(`/collections/${id}/tree`),
  createFolder: (collectionId: number, data: { name: string; parent_id?: number }) =>
    api.post(`/collections/${collectionId}/folders`, data),
}

export const requestsApi = {
  get: (id: number) => api.get<ApiRequest>(`/requests/${id}`),
  create: (collectionId: number, data: ApiRequest) =>
    api.post<ApiRequest>(`/requests/collections/${collectionId}/requests`, data),
  update: (id: number, data: Partial<ApiRequest>) =>
    api.put<ApiRequest>(`/requests/${id}`, data),
  delete: (id: number) => api.delete(`/requests/${id}`),
}

export const executeApi = {
  run: (data: Record<string, unknown>) => api.post<ExecuteResponse>('/execute', data),
}

export const environmentsApi = {
  list: () => api.get<Environment[]>('/environments'),
  create: (data: Partial<Environment>) => api.post<Environment>('/environments', data),
  update: (id: number, data: Partial<Environment>) =>
    api.put<Environment>(`/environments/${id}`, data),
  delete: (id: number) => api.delete(`/environments/${id}`),
}

export const historyApi = {
  list: (limit = 50) => api.get<HistoryEntry[]>(`/history?limit=${limit}`),
  delete: (id: number) => api.delete(`/history/${id}`),
}

export const openApiApi = {
  import: (data: { content: string; collection_name?: string }) =>
    api.post<OpenApiImportResult>('/openapi/import', data),
}
