import { AxiosResponse } from "axios"
import { post, apiDelete } from "./apiService"
import { getCurrentLanguage } from "../util/languageUtil"
import { Application } from "./types/rails/application/RailsApplication"
import { getPrimaryApplicantData } from "../util/listingApplyUtil"
import { StaticData } from "../formEngine/formEngineContext"

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

export const checkHouseholdEligibility = async (
  listingId: string,
  householdSize: number,
  income: string,
  childrenUnder6: number
): Promise<Record<string, unknown>> => {
  const params = {
    listing_id: listingId,
    eligibility: {
      householdsize: householdSize,
      incomelevel: income,
      childrenUnder6: childrenUnder6,
    },
  }
  console.log("Sending", params)
  return post<Record<string, unknown>>("/api/v1/short-form/validate-household", params).then(
    (response) => response.data
  )
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
  return response
}

export interface GISDataResponse {
  gis_data: {
    boundary_match: boolean | null
  }
}

export const getNeighborhoodPreferenceMatch = async (
  address: Address,
  staticData: StaticData,
  applicantInfo: { firstName: string; middleName: string; lastName: string; dob: string }
): Promise<boolean | null> => {
  const { listing, preferenceNames = {} } = staticData
  //     # pick out only the data we need send to the geocoder and format it
  // ['member', 'applicant'].forEach (user) ->
  //   options[user].dob = ShortFormDataService.formatUserDOB(options[user])
  //   options[user] = _.pick options[user], ['firstName', 'lastName', 'dob']
  // options.address = _.pick options.address, ['address1', 'city', 'state', 'zip']
  // options.listing = _.pick options.listing, ['Id', 'Name']
  const getProjectIdForBoundaryMatching = (): string | null => {
    if (!listing) return null
    if ("antiDisplacement" in preferenceNames) return "ADHP"
    if ("neighborhoodResidence" in preferenceNames) return listing?.Project_ID
    return null
  }

  const params = {
    address,
    listing: { id: listing?.Id, name: listing?.Building_Name },
    project_id: getProjectIdForBoundaryMatching(),
    //member, applicant sent over for logging purposes
    member: applicantInfo,
  }

  try {
    const response = await post<GISDataResponse>("/api/v1/addresses/gis-data.json", {
      params,
    })
    return response.data.gis_data.boundary_match
  } catch {
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
