import type { RailsListing } from "../modules/listings/SharedHelpers"
import type { DataSchema } from "../formEngine/formSchemas"
import { t } from "@bloom-housing/ui-components"

const getData = (
  data: DataSchema,
  formData: Record<string, unknown>,
  listingData: RailsListing
) => {
  const { dataSource, dataKey } = data
  return { form: formData, listing: listingData }[dataSource][dataKey]
}

export const translationFromDataSchema = (
  translationKey: string,
  translationVarsData: Record<string, DataSchema>,
  dataSources: { formData: Record<string, unknown>; listingData: RailsListing }
): string => {
  if (!translationVarsData) return t(translationKey)

  const { formData, listingData } = dataSources
  const translationVars = {}
  for (const [varName, data] of Object.entries(translationVarsData)) {
    translationVars[varName] = getData(data, formData, listingData)
  }
  return t(translationKey, translationVars)
}

export const whitelistFields = {
  application: [
    "id",
    "applicationLanguage",
    "listingID",
    "applicationSubmittedDate",
    "applicationSubmissionType",
    "status",
    "autofill",
    "hasPublicHousing",
    "hasMilitaryService",
    "hasDevelopmentalDisability",
    "answeredCommunityScreening",
    "externalSessionId",
    "hasCompletedHomebuyerEducation",
    "isFirstTimeHomebuyer",
    "hasLoanPreapproval",
    "hasMinimumCreditScore",
    "lendingAgent",
    "homebuyerEducationAgency",
    "referral",
    "isNonPrimaryMemberVeteran",
  ],
  primaryApplicant: [
    "alternatePhone",
    "alternatePhoneType",
    "appMemberId",
    "asianOther",
    "blackOther",
    "candidateScore",
    "contactId",
    "email",
    "firstName",
    "gender",
    "genderOther",
    "hasAltMailingAddress",
    "indigenousCentralSouthAmericaGroup",
    "indigenousNativeAmericanGroup",
    "indigenousOther",
    "isVeteran",
    "lastName",
    "latinoOther",
    "menaOther",
    "middleName",
    "noAddress",
    "noEmail",
    "noPhone",
    "otherLanguage",
    "pacificIslanderOther",
    "phone",
    "phoneType",
    "preferenceAddressMatch",
    "primaryLanguage",
    "raceEthnicity",
    "sexualOrientation",
    "sexualOrientationOther",
    "whichComponentOfLocatorWasUsed",
    "whiteOther",
    "xCoordinate",
    "yCoordinate",
  ],
  alternateContact: [
    "appMemberId",
    "alternateContactType",
    "alternateContactTypeOther",
    "agency",
    "email",
    "firstName",
    "lastName",
    "phone",
  ],
  householdMember: [
    "appMemberId",
    "firstName",
    "middleName",
    "lastName",
    "relationship",
    "preferenceAddressMatch",
    "noAddress",
    "xCoordinate",
    "yCoordinate",
    "whichComponentOfLocatorWasUsed",
    "candidateScore",
    "isVeteran",
  ],
}

export interface applicationData {
  application: {
    id: string
    applicationLanguage: string
    listingID: string
    applicationSubmittedDate: string
    applicationSubmissionType: string
    status: string
    autofill: string
    hasPublicHousing: string
    hasMilitaryService: string
    hasDevelopmentalDisability: string
    answeredCommunityScreening: string
    externalSessionId: string
    hasCompletedHomebuyerEducation: string
    isFirstTimeHomebuyer: string
    hasLoanPreapproval: string
    hasMinimumCreditScore: string
    lendingAgent: string
    homebuyerEducationAgency: string
    referral: string
    isNonPrimaryMemberVeteran: string
  }
  id: string
  applicationLanguage: string
  primaryApplicant: {
    contactId: string
    appMemberId: string
    language: string
    phone: string
    firstName: string
    lastName: string
    middleName: string
    noPhone: string
    phoneType: string
    additionalPhone: string
    alternatePhone: string
    alternatePhoneType: string
    email: string
    noEmail: string
    noAddress: string
    hasAltMailingAddress: string
    workInSf: string
    languageOther: string
    gender: string
    genderOther: string
    primaryLanguage: string
    otherLanguage: string
    raceEthnicity: string
    asianOther: string
    blackOther: string
    indigenousOther: string
    latinoOther: string
    menaOther: string
    pacificIslanderOther: string
    whiteOther: string
    sexualOrientation: string
    sexualOrientationOther: string
    isVeteran: string
    indigenousCentralSouthAmericaGroup: string
    indigenousNativeAmericanGroup: string
    hiv: string
    dob: string
    address: string
    city: string
    state: string
    zip: string
    mailingAddress: string
    mailingCity: string
    mailingState: string
    mailingZip: string
    preferenceAddressMatch: string
    xCoordinate: string
    yCoordinate: string
    whichComponentOfLocatorWasUsed: string
    candidateScore: string
    hasCompletedHomebuyerEducation: string
    isFirstTimeHomebuyer: string
    hasMinimumCreditScore: string
    hasLoanPreapproval: string
    isSFUSDEmployee: string
    jobClassification: string
  }
  alternateContact: {
    appMemberId: string
    language: string
    alternateContactType: string
    alternateContactTypeOther: string
    firstName: string
    lastName: string
    agency: string
    phone: string
    email: string
    languageOther: string
    mailingAddress: string
    mailingCity: string
    mailingState: string
    mailingZip: string
  }
  householdMembers: {
    appMemberId: string
    firstName: string
    lastName: string
    middleName: string
    hasSameAddressAsApplicant: string
    noAddress: string
    workInSf: string
    relationship: string
    dob: string
    address: string
    city: string
    state: string
    zip: string
    preferenceAddressMatch: string
    xCoordinate: string
    yCoordinate: string
    whichComponentOfLocatorWasUsed: string
    candidateScore: string
    isVeteran: string
  }
  listingID: string
  shortFormPreferences: {
    listingPreferenceID: string
    recordTypeDevName: string
    appMemberID: string
    certificateNumber: string
    naturalKey: string
    preferenceProof: string
    optOut: string
    individualPreference: string
    shortformPreferenceID: string
    address: string
    city: string
    state: string
    zip: string
  }
  answeredCommunityScreening: string
  adaPrioritiesSelected: string
  householdVouchersSubsidies: string
  referral: string
  hasPublicHousing: string
  hasMilitaryService: string
  hasDevelopmentalDisability: string
  annualIncome: string
  monthlyIncome: string
  totalMonthlyRent: string
  agreeToTerms: string
  applicationSubmissionType: string
  applicationSubmittedDate: string
  status: string
  externalSessionId: string
  formMetadata: string
  hasCompletedHomebuyerEducation: string
  isFirstTimeHomebuyer: string
  hasMinimumCreditScore: string
  hasLoanPreapproval: string
  lendingAgent: string
  homebuyerEducationAgency: string
  isNonPrimaryMemberVeteran: string
}
