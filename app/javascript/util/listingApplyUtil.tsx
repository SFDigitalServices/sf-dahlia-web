import dayjs, { type Dayjs } from "dayjs"
import { type SeniorBuildingAgeRequirement } from "./listingUtil"

export type HouseholdMember = {
  id: string
  firstName: string
  middleName: string
  lastName: string
  birthYear: string
  birthMonth: string
  birthDay: string
}

export const validAge = (
  birthDate: Dayjs,
  minimumAge: number | null,
  seniorBuildingAgeRequirement?: SeniorBuildingAgeRequirement
): boolean => {
  if (seniorBuildingAgeRequirement?.entireHousehold) {
    return dayjs().diff(birthDate, "year") >= seniorBuildingAgeRequirement.minimumAge
  }
  if (minimumAge) {
    return dayjs().diff(birthDate, "year") >= minimumAge
  }
  // "unborn baby" rule
  return dayjs().diff(birthDate, "month") > -10
}

export const validVeteranAge = (birthDate: Dayjs): boolean => {
  return dayjs().diff(birthDate, "year") >= 17
}

export const getPrimaryApplicantData = (formData: Record<string, unknown>) => {
  const firstName = formData.primaryApplicantFirstName as string
  const middleName = formData.primaryApplicantMiddleName as string
  const lastName = formData.primaryApplicantLastName as string
  return {
    firstName,
    middleName,
    lastName,
    dob: (formData.primaryApplicantDob as string) || "1990-01-01", // TODO: update after DAH-3543
  }
}

export const allHouseholdMembers = (formData): HouseholdMember[] => {
  const householdMembers = formData.householdMembers || []
  return [
    ...(householdMembers as HouseholdMember[]),
    {
      id: "primaryApplicant",
      firstName: formData.primaryApplicantFirstName,
      middleName: formData.primaryApplicantMiddleName,
      lastName: formData.primaryApplicantLastName,
      birthYear: formData.primaryApplicantBirthYear,
      birthMonth: formData.primaryApplicantBirthMonth,
      birthDay: formData.primaryApplicantBirthDate,
    },
  ]
}
