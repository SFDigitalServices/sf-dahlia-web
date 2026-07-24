import dayjs, { type Dayjs } from "dayjs"
import { type SeniorBuildingAgeRequirement } from "./listingUtil"
import { PROOF_OPTIONS } from "../modules/constants"

export const getFullName = (person: {
  firstName: string
  middleName: string
  lastName: string
}) => {
  return `${person.firstName || ""} ${person.middleName || ""} ${person.lastName || ""}`
}

export type HouseholdMember = {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  birthYear?: string
  birthMonth?: string
  birthDay?: string
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
export const formatApplicantDOB = (month: string, day: string, year: string): string =>
  `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`

export const getPrimaryApplicantData = (formData: Record<string, unknown>) => {
  const firstName = formData.primaryApplicantFirstName as string
  const middleName = formData.primaryApplicantMiddleName as string
  const lastName = formData.primaryApplicantLastName as string
  const birthMonth = formData.primaryApplicantBirthMonth as string
  const birthDay = formData.primaryApplicantBirthDate as string
  const birthYear = formData.primaryApplicantBirthYear as string

  return {
    firstName,
    middleName,
    lastName,
    dob: formatApplicantDOB(birthMonth, birthDay, birthYear) || "1990-01-01",
  }
}

export const allHouseholdMembers = (formData: Record<string, unknown>): HouseholdMember[] => {
  const householdMembers = (formData.householdMembers || []) as HouseholdMember[]
  return [
    ...householdMembers,
    {
      id: "primaryApplicant",
      firstName: formData.primaryApplicantFirstName as string,
      middleName: formData.primaryApplicantMiddleName as string,
      lastName: formData.primaryApplicantLastName as string,
      birthYear: formData.primaryApplicantBirthYear as string,
      birthMonth: formData.primaryApplicantBirthMonth as string,
      birthDay: formData.primaryApplicantBirthDate as string,
    },
  ]
}

export const generateHouseholdMemberOptions = (householdMembers: HouseholdMember[]) =>
  householdMembers.map((hhMember) => ({
    label: getFullName({
      firstName: hhMember.firstName,
      middleName: hhMember.middleName,
      lastName: hhMember.lastName,
    }),
    value: hhMember.id,
  }))

export const getProofOptions = (preferenceName: string): { value: string; label: string }[] => {
  let lookupName
  if (["liveInSf", "neighborhoodResidence"].includes(preferenceName)) {
    lookupName = "liveInSfAndNeighborhoodResidence"
  } else if (
    ["rightToReturnSunnydale", "rightToReturnHuntersView", "rightToReturnPotrero"].includes(
      preferenceName
    )
  ) {
    lookupName = "rightToReturn"
  } else if (Object.keys(PROOF_OPTIONS).includes(preferenceName)) {
    lookupName = preferenceName
  } else {
    lookupName = "default"
  }
  return PROOF_OPTIONS[lookupName as keyof typeof PROOF_OPTIONS]
}

// TODO: DAH-4176 implement this Angular function in React
// Service.eligibleForRentBurden = -> ...
