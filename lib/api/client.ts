const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "")

const ACCESS_TOKEN_KEY = "parkly.accessToken"
const REFRESH_TOKEN_KEY = "parkly.refreshToken"

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

function getStored(key: string) {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(key)
}

export function storeTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getAccessToken() {
  return getStored(ACCESS_TOKEN_KEY)
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken() {
  const refreshToken = getStored(REFRESH_TOKEN_KEY)
  if (!refreshToken) return null
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Refresh token inválido")
      const data = (await response.json()) as { accessToken: string; refreshToken: string }
      storeTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    })
    .catch(() => {
      clearTokens()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")
  const token = getAccessToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    const nextToken = await refreshAccessToken()
    if (nextToken) return apiRequest<T>(path, init, false)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("parkly:session-expired"))
  }

  const data = await parseResponse(response)
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : "No se pudo completar la solicitud"
    throw new ApiError(message, response.status, data)
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
}