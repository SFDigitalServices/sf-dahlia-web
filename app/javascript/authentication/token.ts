import { t } from "@bloom-housing/ui-components"
import { AxiosHeaders } from "axios"
import { setSiteAlertMessage } from "../components/SiteAlert"
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

export const getHeaders = (): AuthHeaders | AxiosHeaders | undefined => getAuthHeaders()

export const clearHeaders = () => {
  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

export const clearHeadersSignOut = () => {
  if (getStorage().getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)) {
    setSiteAlertMessage(t("signOut.alertMessage.confirmSignOut"), "success")
  }

  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

export const clearHeadersTimeOut = () => {
  if (getStorage().getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)) {
    setSiteAlertMessage(t("signOut.alertMessage.timeout"), "secondary")
  }

  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

export const clearHeadersConnectionIssue = () => {
  if (getStorage().getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)) {
    setSiteAlertMessage(t("signOut.alertMessage.connectionIssue"), "secondary")
  }

  getStorage().removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
}

const getTokenTtl = (): number =>
  Number.parseInt(getAuthHeaders()?.expiry as string) * 1000 - Date.now()
export const isTokenValid = (): boolean => getAuthHeaders() && getTokenTtl() > 0
