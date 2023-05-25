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

export const TENURE_TYPES = {
  NEW_SALE: "New sale",
  RESALE: "Resale",
  NEW_RENTAL: "New rental",
  RE_RENTAL: "Re-rental",
}
