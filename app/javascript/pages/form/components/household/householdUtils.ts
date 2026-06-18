export type HouseholdMember = {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  hasSameAddressAsApplicant: string
  householdMemberAddressStreet?: string
  householdMemberAddressAptOrUnit?: string
  householdMemberAddressCity?: string
  householdMemberAddressState?: string
  householdMemberAddressZipcode?: string
  neighborhoodPreferenceAddressMatch?: boolean
}

const entireHousehold = (formData: Record<string, unknown>): Array<HouseholdMember> => {
  const householdMembers = (formData.householdMembers || []) as Array<HouseholdMember>
  const primaryApplicantMember = {
    id: "primary",
    firstName: formData.primaryApplicantFirstName as string,
    lastName: formData.primaryApplicantLastName as string,
    middleName: formData.primaryApplicantMiddleName as string,
    hasSameAddressAsApplicant: "true",
    householdMemberAddressStreet: formData.primaryApplicantAddressStreet as string,
    householdMemberAddressAptOrUnit: formData.primaryApplicantAddressAptOrUnit as string,
    householdMemberAddressCity: formData.primaryApplicantAddressCity as string,
    householdMemberAddressState: formData.primaryApplicantAddressState as string,
    householdMemberAddressZipcode: formData.primaryApplicantAddressZip as string,
    neighborhoodPreferenceAddressMatch:
      formData.primaryApplicantNeighborhoodPreferenceAddressMatch as boolean,
  }
  return [primaryApplicantMember, ...householdMembers]
}

export const liveInTheNeighborhoodHouseholdMembers = (formData: Record<string, unknown>) => {
  const household = entireHousehold(formData)
  const primaryApplicantLivesInSf =
    household
      .find((member) => member.id === "primary")
      ?.householdMemberAddressCity?.toLowerCase() === "san francisco"
  return household.filter(
    (member) =>
      member.neighborhoodPreferenceAddressMatch &&
      (member.householdMemberAddressCity?.toLowerCase() === "san francisco" ||
        (member.hasSameAddressAsApplicant === "true" && primaryApplicantLivesInSf))
  )
}
