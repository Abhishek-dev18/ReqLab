import { create } from 'zustand'
import type { ApiRequest, Assertion, ExecuteResponse } from '../types'

const defaultRequest: ApiRequest = {
  name: 'Untitled Request',
  method: 'GET',
  url: '',
  headers: {},
  query_params: {},
  body_type: 'none',
  body: null,
  auth_type: 'none',
  auth_config: {},
  assertions: [],
}

interface RequestState {
  currentRequest: ApiRequest
  lastResponse: ExecuteResponse | null
  selectedEnvironmentId: number | null
  responseView: 'pretty' | 'raw'
  setCurrentRequest: (request: Partial<ApiRequest>) => void
  resetRequest: () => void
  loadRequest: (request: ApiRequest) => void
  setLastResponse: (response: ExecuteResponse | null) => void
  setSelectedEnvironmentId: (id: number | null) => void
  setResponseView: (view: 'pretty' | 'raw') => void
  addAssertion: (assertion: Assertion) => void
  removeAssertion: (index: number) => void
  updateAssertion: (index: number, assertion: Assertion) => void
}

export const useRequestStore = create<RequestState>((set) => ({
  currentRequest: { ...defaultRequest },
  lastResponse: null,
  selectedEnvironmentId: null,
  responseView: 'pretty',
  setCurrentRequest: (partial) =>
    set((state) => ({
      currentRequest: { ...state.currentRequest, ...partial },
    })),
  resetRequest: () => set({ currentRequest: { ...defaultRequest }, lastResponse: null }),
  loadRequest: (request) => set({ currentRequest: { ...request }, lastResponse: null }),
  setLastResponse: (lastResponse) => set({ lastResponse }),
  setSelectedEnvironmentId: (selectedEnvironmentId) => set({ selectedEnvironmentId }),
  setResponseView: (responseView) => set({ responseView }),
  addAssertion: (assertion) =>
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        assertions: [...(state.currentRequest.assertions || []), assertion],
      },
    })),
  removeAssertion: (index) =>
    set((state) => ({
      currentRequest: {
        ...state.currentRequest,
        assertions: (state.currentRequest.assertions || []).filter((_, i) => i !== index),
      },
    })),
  updateAssertion: (index, assertion) =>
    set((state) => {
      const assertions = [...(state.currentRequest.assertions || [])]
      assertions[index] = assertion
      return { currentRequest: { ...state.currentRequest, assertions } }
    }),
}))
