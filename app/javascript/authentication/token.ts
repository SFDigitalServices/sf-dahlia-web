export const ACCESS_TOKEN_LOCAL_STORAGE_KEY = "auth_headers"

const getStorage = () => {
  switch (process.env.TOKEN_STORAGE) {
    case "session":
      return sessionStorage
    case "local":
      return localStorage
    default:
      return sessionStorage
  }
}

const getAuthHeaders = () => {
  const headers = getStorage()[ACCESS_TOKEN_LOCAL_STORAGE_KEY]
  return headers && JSON.parse(headers)
}

export interface AuthHeaders {
  expiry: string
  "access-token": string
  client: string
  uid: string
  "token-type": string
}

export const setHeaders = (headers: AuthHeaders) => {
  getStorage().setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(headers))
}

export const getHeaders = () => {
  return getAuthHeaders()
}
export const clearHeaders = () => getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)

export const getTokenTtl = () => {
  return Number.parseInt(getAuthHeaders().expiry) * 1000 - Date.now()
}
