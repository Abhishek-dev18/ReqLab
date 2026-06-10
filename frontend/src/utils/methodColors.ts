const METHOD_COLORS: Record<string, string> = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  PATCH: '#50e3c2',
  DELETE: '#f93e3e',
}

export function getMethodColor(method: string): string {
  return METHOD_COLORS[method.toUpperCase()] ?? '#a6a6a6'
}

export function getMethodBgClass(method: string): string {
  const map: Record<string, string> = {
    GET: 'bg-method-get/15 text-method-get border-method-get/40',
    POST: 'bg-method-post/15 text-method-post border-method-post/40',
    PUT: 'bg-method-put/15 text-method-put border-method-put/40',
    PATCH: 'bg-method-patch/15 text-method-patch border-method-patch/40',
    DELETE: 'bg-method-delete/15 text-method-delete border-method-delete/40',
  }
  return map[method.toUpperCase()] ?? 'bg-pm-muted/15 text-pm-muted border-pm-border'
}
