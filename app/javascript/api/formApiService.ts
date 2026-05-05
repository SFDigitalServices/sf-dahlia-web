import { AxiosResponse } from "axios"
import { post, apiDelete } from "./apiService"
import { getCurrentLanguage, renderMarkup } from "../util/languageUtil"
import { Application } from "./types/rails/application/RailsApplication"
import { getPrimaryApplicantData } from "../util/listingApplyUtil"
import { t } from "@bloom-housing/ui-components"
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

export type VerifiedAddressResponse = {
  address: {
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
    error?: string
    verifications?: {
      delivery: {
        success: boolean
        errors?: Array<{
          code: string
          message?: string
        }>
      }
    }
  }
  error?: string
}

export type Address = {
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
}

export const locateVerifiedAddress = async (address: Address): Promise<VerifiedAddressResponse> => {
  const response = await post<VerifiedAddressResponse>("/api/v1/addresses/validate.json", {
    address,
  }).then((response) => response.data)
  if (address.street1 && address.street2 && address.street1.endsWith(address.street2)) {
    return {
      ...response,
      error: "error.addressValidationDuplicateUnit",
    }
  }
  if (
    address.street1?.match(/P\.?\s*O\.?\s*BOX/i) ||
    (!response.address?.verifications?.delivery?.success &&
      response.address?.verifications?.delivery?.errors?.[0]?.code === "E.BOX_NUMBER.INVALID")
  ) {
    return {
      ...response,
      error: "error.addressValidationPoBox",
    }
  }
  return response
}

export const handleAddressVerification = async (
  data: Record<string, unknown>,
  mailParams: string,
  setAddressError: (error: string | null) => void
) => {
  try {
    setAddressError(null)
    return await locateVerifiedAddress({
      street1: data.addressStreet as string,
      street2: data.addressAptOrUnit as string,
      city: data.addressCity as string,
      state: data.addressState as string,
      zip: data.addressZipcode as string,
    })
  } catch (error) {
    if (error.response?.status === 422) {
      setAddressError(t("error.addressValidation.notFound"))
    } else {
      setAddressError(t(error.message as string))
    }
    return null
  }
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
