export const ACCESS_TOKEN_LOCAL_STORAGE_KEY = "auth_headers"

const getAuthHeaders = () => {
  const headers = sessionStorage[ACCESS_TOKEN_LOCAL_STORAGE_KEY]
  if (!headers) {
    return null
  }
  return JSON.parse(sessionStorage[ACCESS_TOKEN_LOCAL_STORAGE_KEY])
}

export interface AuthHeaders {
  expiry: string
  "access-token": string
  client: string
  uid: string
  "token-type": string
}

export const setHeaders = (headers: AuthHeaders) => {
  sessionStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(headers))
}

export const getHeaders = () => {
  return getAuthHeaders()
}
export const clearHeaders = () => sessionStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)

export const getTokenTtl = () => {
  return parseInt(getAuthHeaders().expiry) * 1000 - new Date().valueOf()
}
