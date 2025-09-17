import { AxiosResponse } from "axios"
import { post } from "./apiService"
import { getCurrentLanguage } from "../util/languageUtil"
import { whitelistFields, type applicationData } from "../util/formEngineUtil"

const formatApplication = (formData: Record<string, unknown>): applicationData => {
  const application: Partial<applicationData> = formData
  return application
}

export const submitForm = async (
  formData: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  formData.status = "submitted"
  formData.session_uid = sessionStorage.getItem("session_uid")
  formData.externalSessionId = sessionStorage.getItem("session_uid")
  const formattedApplication = formatApplication(formData)

  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const formattedDate = `${yyyy}-${mm}-${dd}`
  formData.applicationSubmittedDate = formattedDate

  return post<Record<string, unknown>>("/api/v1/short-form/application", {
    application: formattedApplication,
    autosave: false,
    initialSave: true,
    locale: getCurrentLanguage(),
    uploaded_file: {
      session_uid: formData.session_uid,
    },
  }).then(({ data }: AxiosResponse<Record<string, unknown>>) => {
    console.log("Submitted short form application.", data)
    return data
  })
}
