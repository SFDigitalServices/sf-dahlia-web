import { AxiosResponse } from "axios"
import { post } from "./apiService"
import { getCurrentLanguage } from "../util/languageUtil"
import { Application } from "./types/rails/application/RailsApplication"

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
    primaryApplicant: {
      firstName: formData.primaryApplicantFirstName as string,
      middleName: formData.primaryApplicantMiddleName as string,
      lastName: formData.primaryApplicantLastName as string,
      dob: (formData.primaryApplicantDob as string) || "1990-01-01", // TODO: update after DAH-3543
    },
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
