import RailsRentalListing from "../listings/RailsRentalListing"
import { Person } from "./RailsPerson"
import { Preference } from "./RailsPreference"

export type Application = {
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
