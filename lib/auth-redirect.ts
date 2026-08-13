export function getSafeNextPath(value?: string | null, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export function buildLoginPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(getSafeNextPath(nextPath))}`
}
