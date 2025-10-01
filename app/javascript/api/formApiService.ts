import { AxiosResponse } from "axios"
import { post } from "./apiService"
import { getCurrentLanguage } from "../util/languageUtil"
import { type applicationDataFields } from "../util/formEngineUtil"

export const submitForm = async (
  formData: Record<string, unknown>,
  listingId: string
): Promise<Record<string, unknown>> => {
  // Veterans preference
  const isVeteran = (householdName: string): boolean => {
    return formData.veteranAnswer === "No" ? false : formData.veteranMember === householdName
  }

  const isNonPrimaryMemberVeteran =
    formData.veteranAnswer === "Yes" && isVeteran("primaryApplicant") ? "false" : "true"

  const applicationData: applicationDataFields = {
    listingID: listingId,
    applicationLanguage: getCurrentLanguage(),
    status: "submitted",
    primaryApplicant: {
      firstName: formData.primaryApplicantFirstName as string,
      middleName: formData.primaryApplicantMiddleName as string,
      lastName: formData.primaryApplicantLastName as string,
      dob: (formData.primaryApplicantDob as string) || "1990-01-01", // TODO: remove after DAH-3543
      // email: formData.primaryApplicantEmail as string,
      // phone: formData.primaryApplicantPhone as string,
      // additionalPhone: formData.primaryApplicantAdditionalPhone as string,
      // address: formData.primaryApplicantAddress as string,
      // hasAltMailingAddress: formData.primaryApplicantMailingAddress as string,
      // workInSf: formData.primaryApplicantWorkInSf as string,
      // isVeteran: isVeteran("primaryApplicant") as string
    },
    // alternateContact: {
    //   firstName: formData.alternateContactFirstName as string,
    //   lastName: formData.alternateContactLastName as string,
    //   email: formData.alternateContactEmail as string,
    //   phone: formData.alternateContactPhone as string,
    //   mailingAddress: formData.alternateContactAddress as string,
    //   alternateContactType: formData.alternateContactType as string,
    // },
    householdMembers: [],
    annualIncome: formData.householdIncome as string,
    applicationSubmittedDate: new Date().toISOString().split("T")[0],
    // isNonPrimaryMemberVeteran: isNonPrimaryMemberVeteran,
  }
  console.log("Test log of application data:", applicationData)
  return post<Record<string, unknown>>("/api/v1/short-form/application", {
    application: applicationData,
    autosave: false,
    initialSave: true,
    locale: getCurrentLanguage(),
    // TODO: required field for uploaded file
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
