const ACCESS_TOKEN_LOCAL_STORAGE_KEY = "auth_headers"

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

const getAuthHeaders = (): AuthHeaders | undefined => {
  const headers: string = getStorage()[ACCESS_TOKEN_LOCAL_STORAGE_KEY]
  return headers && JSON.parse(headers)
}

export interface AuthHeaders {
  expiry: string
  "access-token": string
  client: string
  uid: string
  "token-type": string
}

export const setAuthHeaders = (headers: AuthHeaders) => {
  // Set only relevant auth headers
  const headersToSet = {
    expiry: headers.expiry,
    "access-token": headers["access-token"],
    client: headers.client,
    uid: headers.uid,
    "token-type": headers["token-type"],
  }
  getStorage().setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(headersToSet))
}

export const getHeaders = (): AuthHeaders | undefined => getAuthHeaders()
export const clearHeaders = () => getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)

const getTokenTtl = (): number => Number.parseInt(getAuthHeaders()?.expiry) * 1000 - Date.now()
export const isTokenValid = (): boolean => getAuthHeaders() && getTokenTtl() > 0
