export const PREFERENCES = {
  aliceGriffith: "Alice Griffith Housing Development Resident",
  antiDisplacement: "Anti-Displacement Housing Preference (ADHP)",
  assistedHousing: "Rent Burdened / Assisted Housing Preference",
  certificateOfPreference: "Certificate of Preference (COP)",
  dalpEducators: "DALP SFUSD Educators",
  dalpFirstResponders: "DALP First Responders",
  dalpGeneral: "DALP General",
  displacedTenant: "Displaced Tenant Housing Preference (DTHP)",
  employmentOrDisability: "Employment or Disability Preference",
  hud221d3: "HUD 221(d)(3) Statutory Preference; Federal or Presidential Disasters (HUD 221)",
  liveWorkInSf: "Live or Work in San Francisco Preference",
  neighborhoodResidence: "Neighborhood Resident Housing Preference (NRHP)",
  rightToReturnSunnydale: "Right to Return - Sunnydale",
  treasureIsland: "Treasure Island Resident (TIR) Preference",
}

export const PREFERENCES_IDS = {
  aliceGriffith: "hope-sf",
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

export const CUSTOM_LISTING_TYPES = {
  EDUCATOR_ONE: "Educator 1: SFUSD employees only",
  EDUCATOR_TWO: "Educator 2: SFUSD employees & public",
  EDUCATOR_THREE: "Educator 3: Waitlist - SFUSD employees & public",
}

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
  "https://sf.gov/information/learn-how-lottery-works-shirley-chisholm-village",
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
  // Salesforce links that redirect to sf.gov pages
  "http://sfmohcd.org/certificate-preference",
  "http://sfmohcd.org/housing-preference-programs",
  "http://sfmohcd.org/displaced-tenant-housing-preference",
  "http://sfmohcd.org/neighborhood-resident-housing-preference",
]
