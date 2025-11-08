import { AxiosResponse } from "axios"
import { post, apiDelete } from "./apiService"
import { getCurrentLanguage } from "../util/languageUtil"
import { Application } from "./types/rails/application/RailsApplication"
import { getPrimaryApplicantData } from "../util/formEngineUtil"

type UploadProofFileResponse = {
  success: boolean
  name?: string
  created_at?: string
  errors?: string[]
}

export const uploadProofFile = async (
  sessionId: string,
  listingId: string,
  listingPreferenceId: string,
  documentType: string,
  file: File
): Promise<UploadProofFileResponse> => {
  const formData = new FormData()
  formData.append("uploaded_file[session_uid]", sessionId)
  formData.append("uploaded_file[listing_id]", listingId)
  formData.append("uploaded_file[listing_preference_id]", listingPreferenceId)
  formData.append("uploaded_file[document_type]", documentType)
  formData.append("uploaded_file[file]", file)
  return post<UploadProofFileResponse>("/api/v1/short-form/proof", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((response) => response.data)
}

export const deleteUploadedProofFile = async (
  sessionId: string,
  listingId: string,
  listingPreferenceId: string,
  documentType: string
): Promise<{ success: boolean }> => {
  return apiDelete<{ success: boolean }>("/api/v1/short-form/proof", {
    data: {
      uploaded_file: {
        session_uid: sessionId,
        listing_id: listingId,
        listing_preference_id: listingPreferenceId,
        document_type: documentType,
      },
    },
  }).then((response) => response.data)
}

export enum LanguagePrefix {
  English = "English",
  Spanish = "Spanish",
  Chinese = "Chinese",
  Tagalog = "Tagalog",
}

export const submitForm = async (
  formData: Record<string, unknown>,
  listingId: string
): Promise<Record<string, unknown>> => {
  const applicationData: Partial<Application> = {
    listingID: listingId,
    applicationLanguage: LanguagePrefix[getCurrentLanguage()],
    status: "Submitted",
    primaryApplicant: getPrimaryApplicantData(formData),
    householdMembers: [],
    annualIncome: 0, // TODO: update after DAH-3683
    applicationSubmittedDate: new Date().toISOString().split("T")[0],
  }
  return post<Record<string, unknown>>("/api/v1/short-form/application", {
    application: applicationData,
    autosave: false,
    initialSave: true,
    locale: getCurrentLanguage(),
    // TODO: update after DAH-3685
    uploaded_file: {
      file: "todo.png",
    },
  })
    .then(({ data }: AxiosResponse<Record<string, unknown>>) => {
      console.log("Submission response:", data)
      return data
    })
    .catch((error) => {
      console.error("Submission failed:", error)
      throw error
    })
}
