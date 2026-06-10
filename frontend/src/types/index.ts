export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Collection {
  id: number
  name: string
  description: string | null
  owner_id: number
  created_at: string
  updated_at: string
}

export interface Folder {
  id: number
  name: string
  collection_id: number
  parent_id: number | null
  sort_order: number
}

export interface Assertion {
  id?: number
  assertion_type: string
  target?: string | null
  expected_value?: string | null
}

export interface ApiRequest {
  id?: number
  name: string
  method: string
  url: string
  headers: Record<string, string>
  query_params: Record<string, string>
  body_type: string
  body: string | null
  auth_type: string
  auth_config: Record<string, string>
  collection_id?: number
  folder_id?: number | null
  sort_order?: number
  assertions?: Assertion[]
}

export interface Environment {
  id: number
  name: string
  variables: Record<string, string>
  is_global: boolean
  owner_id: number
  collection_id: number | null
  created_at: string
  updated_at: string
}

export interface HistoryEntry {
  id: number
  method: string
  url: string
  status_code: number | null
  response_time_ms: number | null
  request_snapshot: Record<string, unknown>
  response_snapshot: Record<string, unknown>
  assertion_results: AssertionResult[]
  request_id: number | null
  collection_id: number | null
  created_at: string
}

export interface AssertionResult {
  assertion_type: string
  target?: string | null
  expected_value?: string | null
  passed: boolean
  message: string
}

export interface ExecuteResponse {
  status_code: number
  response_time_ms: number
  headers: Record<string, string>
  body: string
  content_type: string | null
  assertion_results: AssertionResult[]
  history_id: number | null
}

export interface DashboardStats {
  total_collections: number
  total_requests: number
  recent_activity: HistoryEntry[]
}

export interface CollectionTree {
  collection_id: number
  folders: Folder[]
  requests: ApiRequest[]
}

export interface OpenApiImportResult {
  id: number
  collection_id: number
  title: string
  version: string | null
  source_format: string
  requests_created: number
  folders_created: number
  created_at: string
}
