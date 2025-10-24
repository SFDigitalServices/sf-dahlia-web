export const PREFERENCES = {
  aliceGriffith: "Alice Griffith Housing Development Resident",
  antiDisplacement: "Anti-Displacement Housing Preference (ADHP)",
  assistedHousing: "Rent Burdened / Assisted Housing Preference",
  rentBurden: "Rent Burdened / Assisted Housing Preference",
  certificateOfPreference: "Certificate of Preference (COP)",
  dalpEducators: "DALP SFUSD Educators",
  dalpFirstResponders: "DALP First Responders",
  dalpGeneral: "DALP General",
  displacedTenant: "Displaced Tenant Housing Preference (DTHP)",
  employmentOrDisability: "Employment or Disability Preference",
  generalLottery: "generalLottery",
  hud221d3: "HUD 221(d)(3) Statutory Preference; Federal or Presidential Disasters (HUD 221)",
  liveWorkInSf: "Live or Work in San Francisco Preference",
  neighborhoodResidence: "Neighborhood Resident Housing Preference (NRHP)",
  rightToReturnSunnydale: "Right to Return - Sunnydale",
  rightToReturnHuntersView: "Right to Return - Hunters View",
  rightToReturnPotrero: "Right to Return - Potrero",
  treasureIsland: "Treasure Island Resident (TIR) Preference",
  veteran: "Veteran",
}

export const PREFERENCES_IDS = {
  rightToReturn: "hope-sf",
  neighborhoodResidence: "nrhp",
  assistedHousing: "rent-burdened-assisted-housing",
  liveWorkInSf: "live-or-work-sf",
  displacedTenant: "dthp",
  certificateOfPreference: "cop",
}

export const PREFERENCES_WITH_PROOF = [
  PREFERENCES.aliceGriffith,
  PREFERENCES.antiDisplacement,
  PREFERENCES.assistedHousing,
  PREFERENCES.liveWorkInSf,
  PREFERENCES.neighborhoodResidence,
  PREFERENCES.rightToReturnSunnydale,
  PREFERENCES.rightToReturnHuntersView,
  PREFERENCES.rightToReturnPotrero,
]

/**
 * 'Reserved Community Type' used at the development or listing level. Not to be
 * confused with the 'Reserved Type' at the unit level
 */
export const RESERVED_COMMUNITY_TYPES = {
  ACCESSIBLE_ONLY: "Accessible Units Only",
  ARTIST: "Artist Live/Work",
  HABITAT: "Habitat for Humanity",
  SENIOR: "Senior",
  VETERAN: "Veteran",
}

export const LISTING_TYPES = {
  OWNERSHIP: "Ownership",
}

export const LISTING_STATUS_ACTIVE = "Active"

export const CUSTOM_LISTING_TYPES = {
  EDUCATOR_ONE: "Educator 1: SFUSD employees only",
  EDUCATOR_TWO: "Educator 2: SFUSD employees & public",
  EDUCATOR_THREE: "Educator 3: Waitlist - SFUSD employees & public",
  DALP: "Downpayment Assistance Loan Program",
}

export const LISTING_TYPE_FIRST_COME_FIRST_SERVED = "First Come, First Served"
export const LISTING_TYPE_STANDARD_LOTTERY = "Standard Lottery"

export const TENURE_TYPES = {
  NEW_SALE: "New sale",
  RESALE: "Resale",
  NEW_RENTAL: "New rental",
  RE_RENTAL: "Re-rental",
}

export const LOTTERY_RANKING_VIDEO_URL = "https://www.youtube.com/watch?v=oW56bUsrSW4"

// Whitelist of allowed SF.gov links for secure redirection
export const SFGOV_LINKS = [
  "https://sf.gov/departments/mayors-office-housing-and-community-development",
  "https://sf.gov/information/learn-about-housing-lottery-preference-programs",
  "https://www.sf.gov/learn-how-lottery-works-shirley-chisholm-village",
  "https://sf.gov/apply-shirley-chisholm-village-housing",
  "https://sf.gov/reports/january-2023/first-come-first-served-bmr-listings",
  "https://sf.gov/reports/december-2022/city-second-program-current-listings",
  "https://sf.gov/information/san-francisco-rental-opportunities",
  "https://sf.gov/reports/august-2023/first-come-first-served-bmr-listings",
  "https://sf.gov/reports/august-2023/city-second-program-current-listings",
  "https://sf.gov/learn-about-certificate-preference-cop",
  "https://sf.gov/displaced-tenant-housing-preference-program-dthp",
  "https://sf.gov/reports/february-2023/find-lender-below-market-rate-program",
  "https://sf.gov/departments/311-customer-service-center",
  "https://sf.gov/sign-complete-homebuyer-education",
  "https://sf.gov/determine-if-you-can-buy-affordable-housing-program",
  "https://sf.gov/reports/october-2023/find-lender-below-market-rate-program",
  "https://sf.gov/departments/city-administrator/digital-services",
  "https://sf.gov/departments/mayors-office-innovation",
  "https://sf.gov/information/special-calculations-household-income",
  "https://sf.gov/after-rental-housing-lottery",
  "https://www.sf.gov/step-by-step/buy-home-without-entering-lottery",
  "https://www.sf.gov/step-by-step--buy-home-without-entering-lottery",
  "https://www.sf.gov/resource/2022/homebuyer-program-counseling-agencies",
  "https://www.sf.gov/dalp-lottery-results",
  // Salesforce links that redirect to sf.gov pages
  "https://www.sf.gov/learn-about-certificate-preference-cop",
  "https://www.sf.gov/get-priority-housing-lottery",
  "https://www.sf.gov/learn-about-displaced-tenant-housing-preference-dthp",
  "https://www.sf.gov/get-priority-housing-lottery",
]

export const DIRECTORY_SECTION_OPEN_LOTTERIES = "open"
export const DIRECTORY_SECTION_FCFS_LISTINGS = "fcfs"
export const DIRECTORY_SECTION_UPCOMING_LOTTERIES = "upcoming"
export const DIRECTORY_SECTION_LOTTERY_RESULTS = "results"
export const DIRECTORY_SECTION_ADDITIONAL_LISTINGS = "additional"

export const SALE_DIRECTORY_SECTIONS = [
  DIRECTORY_SECTION_OPEN_LOTTERIES,
  DIRECTORY_SECTION_FCFS_LISTINGS,
  DIRECTORY_SECTION_UPCOMING_LOTTERIES,
  DIRECTORY_SECTION_LOTTERY_RESULTS,
]
export const RENTAL_DIRECTORY_SECTIONS = [
  DIRECTORY_SECTION_OPEN_LOTTERIES,
  DIRECTORY_SECTION_UPCOMING_LOTTERIES,
  DIRECTORY_SECTION_LOTTERY_RESULTS,
]

export const DIRECTORY_TYPE_SALES = "forSale"
export const DIRECTORY_SECTION_INFO = {
  open: {
    ref: "enter-a-lottery",
    icon: "house",
  },
  fcfs: {
    ref: "buy-now",
  },
  additional: {
    ref: "additional-listings",
    icon: "doubleHouse",
  },
  upcoming: {
    ref: "upcoming-lotteries",
    icon: "clock",
  },
  results: {
    ref: "lottery-results",
    icon: "result",
  },
}

export const DIRECTORY_PAGE_HEADER = "page-header"

// Unleash feature flags
export const UNLEASH_FLAG = {
  CLERK_AUTH: "temp.webapp.auth.clerk",
  FORM_ENGINE: "perm.webapp.formEngine",
  FORM_ENGINE_DEBUG: "perm.webapp.formEngine.debug",
}

export const LISTING_APPLY_FORMS_INPUT_MAX_LENGTH = {
  firstName: 40,
  middleName: 20,
  lastName: 40,
  email: 50,
  password: 50,
  address: 75,
  city: 75,
  alternateContactTypeOther: 50,
  alternateContactAgency: 50,
  certificateNumber: 50,
  genderOther: 50,
  otherLanguage: 50,
  sexualOrientationOther: 50,
  raceEthnicityOther: 50,
}

export const LATIN_REGEX = new RegExp("^[A-z0-9\u00C0-\u017E\\s'.,-/+#%$:=-_`~()]+$")
