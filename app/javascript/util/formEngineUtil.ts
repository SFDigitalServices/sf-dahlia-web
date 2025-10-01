import type { DataSchema, StepInfoSchema } from "../formEngine/formSchemas"
import type { DataSources } from "../formEngine/formEngineContext"
import { t } from "@bloom-housing/ui-components"

export const translationFromDataSchema = (
  translationKey: string,
  translationVarsData: Record<string, DataSchema>,
  dataSources: DataSources
): string => {
  if (!translationVarsData) return t(translationKey)

  const translationVars = {}
  for (const [varName, data] of Object.entries(translationVarsData)) {
    const { dataSource, dataKey } = data
    translationVars[varName] = dataSources[dataSource][dataKey]
  }
  return t(translationKey, translationVars)
}

export interface applicationDataFields {
  id?: string
  applicationLanguage?: string
  primaryApplicant?: {
    contactId?: string
    appMemberId?: string
    language?: string
    phone?: string
    firstName?: string
    lastName?: string
    middleName?: string
    noPhone?: string
    phoneType?: string
    additionalPhone?: string
    alternatePhone?: string
    alternatePhoneType?: string
    email?: string
    noEmail?: string
    noAddress?: string
    hasAltMailingAddress?: string
    workInSf?: string
    languageOther?: string
    gender?: string
    genderOther?: string
    primaryLanguage?: string
    otherLanguage?: string
    raceEthnicity?: string
    asianOther?: string
    blackOther?: string
    indigenousOther?: string
    latinoOther?: string
    menaOther?: string
    pacificIslanderOther?: string
    whiteOther?: string
    sexualOrientation?: string
    sexualOrientationOther?: string
    isVeteran?: string
    indigenousCentralSouthAmericaGroup?: string
    indigenousNativeAmericanGroup?: string
    hiv?: string
    dob?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    mailingAddress?: string
    mailingCity?: string
    mailingState?: string
    mailingZip?: string
    preferenceAddressMatch?: string
    xCoordinate?: string
    yCoordinate?: string
    whichComponentOfLocatorWasUsed?: string
    candidateScore?: string
    hasCompletedHomebuyerEducation?: string
    isFirstTimeHomebuyer?: string
    hasMinimumCreditScore?: string
    hasLoanPreapproval?: string
    isSFUSDEmployee?: string
    jobClassification?: string
  }
  alternateContact?: {
    appMemberId?: string
    language?: string
    alternateContactType?: string
    alternateContactTypeOther?: string
    firstName?: string
    lastName?: string
    agency?: string
    phone?: string
    email?: string
    languageOther?: string
    mailingAddress?: string
    mailingCity?: string
    mailingState?: string
    mailingZip?: string
  }
  householdMembers?: {
    appMemberId?: string
    firstName?: string
    lastName?: string
    middleName?: string
    hasSameAddressAsApplicant?: string
    noAddress?: string
    workInSf?: string
    relationship?: string
    dob?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    preferenceAddressMatch?: string
    xCoordinate?: string
    yCoordinate?: string
    whichComponentOfLocatorWasUsed?: string
    candidateScore?: string
    isVeteran?: string
  }[]
  listingID?: string
  shortFormPreferences?: {
    listingPreferenceID?: string
    recordTypeDevName?: string
    appMemberID?: string
    certificateNumber?: string
    naturalKey?: string
    preferenceProof?: string
    optOut?: string
    individualPreference?: string
    shortformPreferenceID?: string
    address?: string
    city?: string
    state?: string
    zip?: string
  }[]
  answeredCommunityScreening?: string
  adaPrioritiesSelected?: string
  householdVouchersSubsidies?: string
  referral?: string
  hasPublicHousing?: string
  hasMilitaryService?: string
  hasDevelopmentalDisability?: string
  annualIncome?: string
  monthlyIncome?: string
  totalMonthlyRent?: string
  agreeToTerms?: string
  applicationSubmissionType?: string
  applicationSubmittedDate?: string
  status?: string
  externalSessionId?: string
  formMetadata?: string
  hasCompletedHomebuyerEducation?: string
  isFirstTimeHomebuyer?: string
  hasMinimumCreditScore?: string
  hasLoanPreapproval?: string
  lendingAgent?: string
  homebuyerEducationAgency?: string
  isNonPrimaryMemberVeteran?: string
}

export const showStep = (
  operation: string,
  conditions: DataSchema[],
  dataSources: DataSources
): boolean => {
  const processedConditions = conditions.map((condition) => {
    const processedCondition = dataSources[condition.dataSource][condition.dataKey]
    return condition.negate ? !processedCondition : !!processedCondition
  })
  if (operation === "showStepIfAllPresent") {
    return processedConditions.every(Boolean)
  }
  if (operation === "showStepIfAnyPresent") {
    return processedConditions.some(Boolean)
  }
  if (operation === "hideStepIfAllPresent") {
    return !processedConditions.every(Boolean)
  }
  if (operation === "hideStepIfAnyPresent") {
    return !processedConditions.some(Boolean)
  }
  return true
}

export const calculateNextStep = (
  currentStepIndex: number,
  stepInfoMap: StepInfoSchema[],
  dataSources: DataSources
): number => {
  const nextStepSlug = stepInfoMap[currentStepIndex]?.navigationDeparture?.nextStep
  if (nextStepSlug) {
    return stepInfoMap.findIndex((step) => step.slug === nextStepSlug)
  }

  for (const [idx, step] of stepInfoMap.entries()) {
    if (idx <= currentStepIndex) continue
    if (!step.navigationArrival) return idx
    if (step.navigationArrival) {
      const [operation, conditions] = Object.entries(step.navigationArrival)[0]
      if (showStep(operation, conditions, dataSources)) return idx
    }
  }
}

export const calculatePrevStep = (
  currentStepIndex: number,
  stepInfoMap: StepInfoSchema[],
  dataSources: DataSources
): number => {
  const prevStepSlug = stepInfoMap[currentStepIndex]?.navigationDeparture?.prevStep
  if (prevStepSlug) {
    return stepInfoMap.findIndex((step) => step.slug === prevStepSlug)
  }

  const reversedCurrentStepIndex = stepInfoMap.length - 1 - currentStepIndex
  for (const [idx, step] of stepInfoMap.reverse().entries()) {
    if (idx <= reversedCurrentStepIndex) continue
    if (!step.navigationArrival) return stepInfoMap.length - 1 - idx
    if (step.navigationArrival) {
      const [operation, conditions] = Object.entries(step.navigationArrival)[0]
      if (showStep(operation, conditions, dataSources)) return stepInfoMap.length - 1 - idx
    }
  }
}
