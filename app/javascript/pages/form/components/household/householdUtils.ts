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
  workInSf?: string
}

export type HouseholdMemberInfo = {
  id: string
  firstName: string
  lastName: string
}

const entireHousehold = (formData: Record<string, unknown>): Array<HouseholdMember> => {
  const householdMembers = (formData.householdMembers || []) as Array<HouseholdMember>
  const primaryApplicantMember = {
    id: "primary",
    firstName: formData.primaryApplicantFirstName as string,
    lastName: formData.primaryApplicantLastName as string,
    middleName: formData.primaryApplicantMiddleName as string,
    hasSameAddressAsApplicant: "true",
    workInSf: formData.primaryApplicantWorkInSf as string,
    householdMemberAddressStreet: formData.primaryApplicantAddressStreet as string,
    householdMemberAddressAptOrUnit: formData.primaryApplicantAddressAptOrUnit as string,
    householdMemberAddressCity: formData.primaryApplicantAddressCity as string,
    householdMemberAddressState: formData.primaryApplicantAddressState as string,
    householdMemberAddressZipcode: formData.primaryApplicantAddressZipcode as string,
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

const householdMemberInfo = (member: HouseholdMember) => ({
  id: member.id,
  firstName: member.firstName,
  lastName: member.lastName,
})

const checkLiveWorkEligibility = (liveWorkMembers: Array<HouseholdMemberInfo>) =>
  liveWorkMembers.length > 0 ? "true" : "false"

export const getLiveWorkInSfMembers = (
  data: Record<string, unknown>
): {
  // TODO: DAH-4161
  //   liveInSfMembers: Array<HouseholdMemberInfo>
  //   workInSfMembers: Array<HouseholdMemberInfo>
  //   liveWorkInSfMembers: Array<HouseholdMemberInfo>
  livesInSf: string
  worksInSf: string
  liveWorksInSf: string
  showLiveWorkPreference: string
} => {
  const allHouseholdMembers = entireHousehold(data)

  const primaryLivesInSf =
    (data.primaryApplicantAddressCity as string)?.toLowerCase().trim() === "san francisco"
  const memberLivesInSf = (member: HouseholdMember) =>
    member.hasSameAddressAsApplicant === "true"
      ? primaryLivesInSf
      : member.householdMemberAddressCity?.toLowerCase().trim() === "san francisco"

  // TODO: DAH-4161 Use member info to populate select dropdown
  // Identify and populate eligible live/work in SF members
  const liveInSfMembers: HouseholdMemberInfo[] = []
  const workInSfMembers: HouseholdMemberInfo[] = []
  const liveWorkInSfMembers: HouseholdMemberInfo[] = []

  for (const member of allHouseholdMembers) {
    const livesInSf = memberLivesInSf(member)
    const worksInSf = member.workInSf === "true"
    if (!livesInSf && !worksInSf) continue

    const memberInfo = householdMemberInfo(member)
    if (livesInSf) liveInSfMembers.push(memberInfo)
    if (worksInSf) workInSfMembers.push(memberInfo)
    if (livesInSf && worksInSf) liveWorkInSfMembers.push(memberInfo)
  }

  const livesInSf = checkLiveWorkEligibility(liveInSfMembers)
  const worksInSf = checkLiveWorkEligibility(workInSfMembers)
  const liveWorksInSf = checkLiveWorkEligibility(liveWorkInSfMembers)
  const showLiveWorkPreference = livesInSf === "true" || worksInSf === "true" ? "true" : "false"

  return {
    // liveInSfMembers,
    // workInSfMembers,
    // liveWorkInSfMembers,
    livesInSf,
    worksInSf,
    liveWorksInSf,
    showLiveWorkPreference,
  }
}
