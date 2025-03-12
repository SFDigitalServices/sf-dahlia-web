import { AxiosHeaders } from "axios"
import { AlertReason, getLocalizedPath } from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"
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

const getAuthHeaders = (): AuthHeaders | AxiosHeaders | undefined => {
  const headers: string = getStorage().getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  return headers && JSON.parse(headers)
}

export interface AuthHeaders extends AxiosHeaders {
  expiry: string
  "access-token": string
  client: string
  uid: string
  "token-type": string
}

export const setAuthHeaders = (headers: AuthHeaders | AxiosHeaders) => {
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

export const parseUrlParams = (url: string): URLSearchParams => {
  const urlObj = new URL(url)
  return urlObj.searchParams
}

export interface TemporaryURLParams {
  expiry: string | null
  accessToken: string | null
  client: string | null
  uid: string | null
  tokenType: string
  reset_password: string | null
}

export const attemptToSetAuthHeadersFromURL = () => {
  const params = parseUrlParams(window.location.href)
  const expiry = params.get("expiry")
  const accessToken = params.get("access-token")
  const client = params.get("client")
  const uid = params.get("uid")
  const tokenType = params.get("token-type") || "Bearer"
  if (expiry && accessToken && client && uid && tokenType) {
    setAuthHeaders({
      expiry,
      "access-token": accessToken,
      client,
      uid,
      "token-type": tokenType,
    } as AuthHeaders)
    return true
  } else return false
}

export const setSignInPageAlert = (alert: AlertReason) => {
  const alertParam = `?alert=${alert}`
  const language = getCurrentLanguage()
  return getLocalizedPath("/sign-in", language, alertParam)
}

export const getHeaders = (): AuthHeaders | AxiosHeaders | undefined => getAuthHeaders()

export const clearHeaders = () => {
  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

export const clearHeadersSignOut = () => {
  if (getStorage().getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)) {
    window.location.href = setSignInPageAlert(AlertReason.SignOut)
  }

  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

export const clearHeadersTimeOut = () => {
  if (getStorage().getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)) {
    window.location.href = setSignInPageAlert(AlertReason.TimeOut)
  }
  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

export const clearHeadersConnectionIssue = () => {
  if (getStorage().getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)) {
    window.location.href = setSignInPageAlert(AlertReason.ConnectionIssue)
  }

  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

const getTokenTtl = (): number =>
  Number.parseInt(getAuthHeaders()?.expiry as string) * 1000 - Date.now()
export const isTokenValid = (): boolean => getAuthHeaders() && getTokenTtl() > 0
