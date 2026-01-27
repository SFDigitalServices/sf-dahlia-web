// These types are derived from the Salesforce Apex Class API_Application
// Although almost all fields are optional according to the Apex class,
//   there may be validations in the recesses of Salesforce code that make some
//   fields mandatory for some situations

import { RailsListing } from "../../../../modules/listings/SharedHelpers"

// POJO that can be serialized to JSON and sent to /shortForm endpoint as is
export type Application = {
  id: string
  listingID: string
  applicationLanguage: "English" | "Spanish" | "Chinese" | "Filipino"
  primaryApplicant: PrimaryApplicant
  lendingAgent: string // aka contact id
  alternateContact: AlternateContact
  householdMembers: HouseholdMember[]
  shortFormPreferences: ShortFormPreference[]
  referral?: Referral
  agreeToTerms: boolean
  isFirstTimeHomebuyer: boolean
  hasMinimumCreditScore: boolean
  hasCompletedHomebuyerEducation: boolean
  hasLoanPreapproval: boolean
  isNonPrimaryMemberVeteran: "Yes" | "No" | "Decline to state"
  householdVouchersSubsidies?: "true" | "false"
  annualIncome: number
  monthlyIncome: number
  totalMonthlyRent: number
  externalSessionId: string // "#{uuid.v4()}-#{uuid.v4()}"
  status: "Draft" | "Submitted" | "Removed" | "Submitted - Needs Review"
  applicationSubmissionType: "Electronic" | "Paper"
  applicationSubmittedDate: string // "YYYY-MM-DD"
  formMetadata: string // JSON.stringify(_.pick(app,'completedSections', 'session_uid','lastPage','groupedHouseholdAddresses','aliceGriffith_address_verified')
  adaPrioritiesSelected: AdaPriority
  homebuyerEducationAgency: HomebuyerEducationAgency
  hasPublicHousing?: "Yes" | "No"
  hasMilitaryService: "Yes" | "No"
  hasDevelopmentalDisability?: "Yes" | "No"
  answeredCommunityScreening?: "Yes" | "No"
  listing: RailsListing
  lotteryNumber: number
  // isSFUSDEmployee: ; // calculated by Salesforce
  // jobClassification: ; // calculated by Salesforce
  // hasDisability: ; // calculated by Salesforce
  // isPrimaryApplicantVeteran: ; // calculated by Salesforce
  // isVeteranInHousehold: ; // calculated by Salesforce
  // lotteryNumber: ; // calculated by Salesforce
  // lotteryNumberManual: ; // calculated by Salesforce
  // didApplicantUseHousingCounselingAgency: ; // filled out within Salesforce
  // housingCounselingAgency: ; // filled out within Salesforce
  // otherHousingCounselingAgency: ; // filled out within Salesforce
}

type PrimaryApplicant = {
  contactId?: string
  appMemberId?: string
  phone?: string // html attr: type="tel", Salesforce type: Phone
  firstName: string
  lastName: string
  middleName?: string
  noPhone?: boolean
  phoneType?: "Home" | "Work" | "Cell"
  alternatePhone?: string // html attr: type="tel", Salesforce type: Phone
  alternatePhoneType?: "Home" | "Work" | "Cell"
  email?: string
  noEmail?: boolean
  noAddress?: boolean
  hasAltMailingAddress?: boolean
  workInSf?: "true" | "false"
  gender?: Gender
  genderOther?: string
  primaryLanguage?: PrimaryLanguage
  otherLanguage?: string
  raceEthnicity?: RaceAndEthnicity
  asianOther?: string
  blackOther?: string
  indigenousOther?: string
  latinoOther?: string
  menaOther?: string
  pacificIslanderOther?: string
  whiteOther?: string
  sexualOrientation?: SexualOrientation
  sexualOrientationOther?: string
  isVeteran?: "Yes" | "No" | "Decline to state"
  indigenousCentralSouthAmericaGroup?: string
  hiv?: boolean
  dob: string // "YYYY-MM-DD"
  address?: string // aka street adress
  city?: string
  state?: string // only two letter abbreviations
  zip?: string
  mailingAddress?: string // aka street adress
  mailingCity?: string
  mailingState?: string // only two letter abbreviations
  mailingZip?: string
  preferenceAddressMatch?: "Matched" | "Not Matched"
  xCoordinate?: string
  yCoordinate?: string
  whichComponentOfLocatorWasUsed?: string
  candidateScore?: number
  isSFUSDEmployee?: "Yes" | "No"
  jobClassification?: string
  webAppID?: string
}

type AlternateContact = {
  appMemberId: string
  alternateContactType: AlternateContactType
  alternateContactTypeOther: string
  agency: string
  email: string
  firstName: string
  lastName: string
  phone: string // html attr: type="tel", Salesforce type: Phone
  address: string // aka street adress
  city: string
  state: string // only two letter abbreviations
  zip: string
  mailingAddress: string // aka street adress
  mailingCity: string
  mailingState: string // only two letter abbreviations
  mailingZip: string
}

type HouseholdMember = {
  appMemberId: string
  firstName: string
  lastName: string
  middleName: string
  hasSameAddressAsApplicant: boolean
  noAddress: boolean
  workInSf: "true" | "false"
  relationship: string
  dob: string // "YYYY-MM-DD"
  address: string // aka street adress
  city: string
  state: string // only two letter abbreviations
  zip: string
  preferenceAddressMatch: "Matched" | "Not Matched"
  xCoordinate: string
  yCoordinate: string
  whichComponentOfLocatorWasUsed: string
  candidateScore: number
}

type ShortFormPreference = {
  shortformPreferenceID: string
  applicationID: string
  appMemberID: string
  individualPreference: IndividualPreference
  requiresProof: boolean
  recordTypeDevName: string
  preferenceProof: ProofType
  lwPreferenceProof: LiveWorkProofType
  postLotteryValidation: "Confirmed" | "Unconfirmed" | "Invalid"
  optOut: boolean
  listingPreferenceID: string
  customPreferenceType: string // Salesforce only checks if this equals "V-L_W"
  certificateNumber: string
  vetStatus: "Confirmed" | "Unconfirmed" | "Invalid"
  vetPreferenceProof: "DD Form 214" | "DD Form 256"
  address: string // aka street adress
  city: string
  state: string // only two letter abbreviations
  zip: string
}

type Referral =
  | "Newspaper"
  | "MOHCD Website"
  | "Developer Website"
  | "Flyer"
  | "Radio Ad"
  | "Bus Ad"
  | "Email Alert"
  | "Friend"
  | "Housing Counselor"
  | "Other"

type AdaPriority =
  | "Adaptable"
  | "Hearing/Vision impairments"
  | "Hearing impairments"
  | "Mobility/Hearing/Vision impairments"
  | "Mobility impairments"
  | "Vision impairments"
  | "None"

type HomebuyerEducationAgency =
  | "ASIAN Inc."
  | "BALANCE"
  | "Home SF"
  | "Mission Economic Development Agency"
  | "San Francisco Housing Development Corporation"
  | "San Francisco LGBT Community Center"
  | "SF Urban CHC"

type SexualOrientation =
  | "Straight/Heterosexual"
  | "Bisexual"
  | "Questioning/Unsure"
  | "Gay/Lesbian/Same-Gender Loving"
  | "Not listed"
  | "Decline to state"

type Gender =
  | "Male"
  | "Female"
  | "Genderqueer/Gender Non-binary"
  | "Trans Male"
  | "Trans Female"
  | "Not Listed"
  | "Decline to state"

type PrimaryLanguage =
  | "English"
  | "Cantonese Chinese"
  | "Mandarin Chinese"
  | "Spanish"
  | "Filipino"
  | "Vietnamese"
  | "Russian"
  | "Other"

type AlternateContactType =
  | "Other"
  | "Family Member"
  | "Friend"
  | "Social Worker or Housing Counselor"

type IndividualPreference =
  | "Live in SF"
  | "Work in SF"
  | "Assisted Housing"
  | "Rent Burdened"
  | "Works in public healthcare"
  | "Works in public education"
  | "Cannot work due to disability"

type ProofType =
  | "Letter from SFHA verifying address"
  | "CA ID or Driver's License"
  | "Telephone bill (landline only)"
  | "Telephone bill"
  | "Cable and internet bill"
  | "Paystub (listing home address)"
  | "Gas bill"
  | "Electric bill"
  | "Garbage bill"
  | "Water bill"
  | "Paystub"
  | "Public benefits record"
  | "School record"
  | "Paystub with employer address"
  | "Letter from employer"
  | "Letter documenting homelessness"
  | "Lease and rent proof"
  | "Lease"
  | "Custom Proof"
  | "SFHA Lease"
  | "SF City ID"

type LiveWorkProofType =
  | "Telephone bill"
  | "Cable and internet bill"
  | "Gas bill"
  | "Electric bill"
  | "Garbage bill"
  | "Water bill"
  | "Paystub"
  | "Public benefits record"
  | "School record"
  | "Paystub with employer address"
  | "Letter from employer"
  | "Letter documenting homelessness"
  | "Lease and rent proof"
  | "Lease"
  | "Custom Proof"
  | "Third-Party Proof of SF Homelessness"

type RaceAndEthnicity =
  | "Asian - Chinese"
  | "Asian - Filipino"
  | "Asian - Japanese"
  | "Asian - Korean"
  | "Asian - Mongolian"
  | "Asian - Central Asian"
  | "Asian - South Asian"
  | "Asian - Southeast Asian"
  | "Asian - Other"
  | "Black - African"
  | "Black - African American"
  | "Black - Caribbean, Central American, South American or Mexican"
  | "Black - Other"
  | "Indigenous - American Indian/Native American"
  | "Indigenous - Indigenous from Mexico, the Caribbean, Central America, or South America"
  | "Indigenous - Other"
  | "Latino - Caribbean"
  | "Latino - Central American"
  | "Latino - Mexican"
  | "Latino - South American"
  | "Latino - Other"
  | "Middle Eastern/West Asian or North African - North African"
  | "Middle Eastern/West Asian or North African - West Asian"
  | "Middle Eastern/West Asian or North African - Other"
  | "Pacific Islander - Chamorro"
  | "Pacific Islander - Native Hawaiian"
  | "Pacific Islander - Samoan"
  | "Pacific Islander - Other"
  | "White - European"
