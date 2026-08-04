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

export const getLiveWorkInSfMembers = (
  data: Record<string, unknown>
): {
  liveInSfMembers: Array<HouseholdMemberInfo>
  workInSfMembers: Array<HouseholdMemberInfo>
  livesInSf: boolean
  worksInSf: boolean
  liveWorksInSf: boolean
  showLiveWorkPreference: boolean
} => {
  const allHouseholdMembers = entireHousehold(data)

  const primaryLivesInSf =
    (data.primaryApplicantAddressCity as string)?.toLowerCase().trim() === "san francisco"
  const memberLivesInSf = (member: HouseholdMember) =>
    member.hasSameAddressAsApplicant === "true"
      ? primaryLivesInSf
      : member.householdMemberAddressCity?.toLowerCase().trim() === "san francisco"

  // Identify and populate eligible live/work in SF members
  const liveInSfMembers: HouseholdMemberInfo[] = []
  const workInSfMembers: HouseholdMemberInfo[] = []

  for (const member of allHouseholdMembers) {
    const livesInSf = memberLivesInSf(member)
    const worksInSf = member.workInSf === "true"
    if (!livesInSf && !worksInSf) continue

    const memberInfo = householdMemberInfo(member)
    if (livesInSf) liveInSfMembers.push(memberInfo)
    if (worksInSf) workInSfMembers.push(memberInfo)
  }

  const livesInSf = liveInSfMembers.length > 0 && workInSfMembers.length === 0
  const worksInSf = workInSfMembers.length > 0 && liveInSfMembers.length === 0
  const liveWorksInSf = liveInSfMembers.length > 0 && workInSfMembers.length > 0

  const showLiveWorkPreference = livesInSf || worksInSf || liveWorksInSf

  return {
    liveInSfMembers,
    workInSfMembers,
    livesInSf,
    worksInSf,
    liveWorksInSf,
    showLiveWorkPreference,
  }
}

export const getEligiblePreferenceMembers = (
  formData: Record<string, unknown>,
  preferenceName: string
): HouseholdMemberInfo[] => {
  const { liveInSfMembers, workInSfMembers } = getLiveWorkInSfMembers(formData)

  switch (preferenceName) {
    case "liveInSf":
      return liveInSfMembers
    case "workInSf":
      return workInSfMembers
    case "neighborhoodResidence":
    case "antiDisplacement":
      return liveInTheNeighborhoodHouseholdMembers(formData)
    default:
      return entireHousehold(formData)
  }
}
