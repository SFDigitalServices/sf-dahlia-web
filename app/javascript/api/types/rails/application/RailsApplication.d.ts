import RailsRentalListing from "../listings/RailsRentalListing"

type Preference = {
  zip: string | null
  vetStatus: string | null
  vetPreferenceProof: string | null
  state: string | null
  shortformPreferenceID: string
  requiresProof: boolean
  recordTypeDevName: string
  preferenceProof: string | null
  postLotteryValidation: string | null
  optOut: boolean
  naturalKey: string | null
  lwPreferenceProof: string | null
  listingPreferenceID: string
  individualPreference: string | null
  customPreferenceType: string
  city: string | null
  certificateNumber: string | null
  appMemberID: string | null
  applicationID: string
  address: string | null
}

type Person = {
  zip: string
  yCoordinate: string
  xCoordinate: string
  workInSf: string
  whiteOther: string | null
  whichComponentOfLocatorWasUsed: string
  webAppID: string
  state: string
  sexualOrientationOther: string | null
  sexualOrientation: string | null
  sexAtBirth: string | null
  relationship: string | null
  raceEthnicity: string | null
  race: string | null
  primaryLanguage: string | null
  preferenceAddressMatch: string
  phoneType: string
  phone: string
  pacificIslanderOther: string | null
  otherLanguage: string | null
  noPhone: boolean
  noEmail: boolean
  noAddress: boolean
  MLSId: string | null
  middleName: string | null
  menaOther: string | null
  MCCCertified: string | null
  mailingZip: string
  mailingState: string
  mailingCity: string
  mailingAddress: string
  lendingAgentStatus: string | null
  latinoOther: string | null
  lastName: string
  jobClassification: string | null
  isVeteran: string
  isSFUSDEmployee: string
  indigenousOther: string | null
  indigenousNativeAmericanGroup: string | null
  indigenousCentralSouthAmericaGroup: string | null
  hiv: boolean
  hasSameAddressAsApplicant: string | null
  hasDisability: string | null
  hasAltMailingAddress: boolean
  genderOther: string | null
  gender: string | null
  firstName: string
  ethnicity: string | null
  email: string
  DOB: string
  DALPCertified: string | null
  contactId: string
  city: string
  candidateScore: number
  BMRCertified: string | null
  blackOther: string | null
  asianOther: string | null
  appMemberType: string
  appMemberId: string
  alternatePhoneType: string | null
  alternatePhone: string | null
  alternateContactTypeOther: string | null
  alternateContactType: string | null
  agency: string | null
  address: string
  accountId: string | null
  acceptingNewMOHCDClients: string | null
}

type Application = {
  totalMonthlyRent: number
  status: string
  shortFormPreferences: Preference[]
  referral: string | null
  primaryApplicant: Person
  otherHousingCounselingAgency: string | null
  name: string
  monthlyIncome: number | null
  lotteryNumberManual: string | null
  lotteryNumber: string
  listingID: string
  lendingAgent: string | null
  jobClassification: string | null
  isVeteranInHousehold: boolean
  isSFUSDEmployee: string
  isPrimaryApplicantVeteran: string
  isNonPrimaryMemberVeteran: string | null
  isFirstTimeHomebuyer: boolean
  id: string
  housingCounselingAgency: string | null
  householdVouchersSubsidies: string
  householdMembers: Person[]
  homebuyerEducationAgency: string | null
  hasSenior: string | null
  hasPublicHousing: string | null
  hasMinimumCreditScore: boolean
  hasMilitaryService: string | null
  hasLoanPreapproval: boolean
  hasDisability: string | null
  hasDevelopmentalDisability: string | null
  hasCompletedHomebuyerEducation: boolean
  formMetadata: string
  externalSessionId: string
  didApplicantUseHousingCounselingAgency: string | null
  appRTType: string
  applicationSubmittedDate: string
  applicationSubmissionType: string
  applicationLanguage: string
  answeredCommunityScreening: string | null
  annualIncome: number
  alternateContact: Person | null
  agreeToTerms: boolean
  adaPrioritiesSelected: string
  listing: RailsRentalListing
}
