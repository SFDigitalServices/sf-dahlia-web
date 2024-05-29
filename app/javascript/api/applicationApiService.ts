import {
  RailsShortFormApplication,
  RailsShortFormResponse,
} from "../pages/ShortForm/ShortFormApplicationHelpers"
import { draftApplication, updateApplication } from "./apiEndpoints"
import { authenticatedGet, authenticatedPut } from "./apiService"

export const isUserLoggedIn = () => {
  let storage: Storage
  switch (process.env.TOKEN_STORAGE) {
    case "session":
      storage = sessionStorage
      break
    case "local":
      storage = localStorage
      break
    default:
      storage = sessionStorage
  }
  const headers = storage.getItem("auth_headers")
  return !!headers
}

export const getDraftApplication = async (
  listingId?: string
): Promise<RailsShortFormApplication> => {
  return isUserLoggedIn()
    ? authenticatedGet<RailsShortFormResponse>(draftApplication(listingId)).then(({ data }) => {
        return data.application
      })
    : {}
}

export const postUpdateApplication = async (
  listingId: string,
  application: RailsShortFormApplication
): Promise<RailsShortFormApplication> => {
  return authenticatedPut<RailsShortFormResponse>(updateApplication(listingId), {
    application,
    uploaded_file: { session_uid: application.externalSessionId },
  }).then(({ data }) => {
    return data.application
  })
}
