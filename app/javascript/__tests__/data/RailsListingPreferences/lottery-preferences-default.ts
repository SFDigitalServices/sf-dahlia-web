import type { RailsListingPreference } from "../../../api/types/rails/listings/RailsListingPreferences"

// Listings always have COP, DHTP and L/W
export const preferences: RailsListingPreference[] = [
  {
    unitsAvailable: 6,
    requiresProof: false,
    readMoreUrl: "https://www.sf.gov/learn-about-certificate-preference-cop",
    preferenceProofRequirementDescription: null,
    preferenceName: "Certificate of Preference (COP)",
    pdfUrl: null,
    order: 1,
    NRHPDistrict: null,
    name: "LP-399931",
    listingPreferenceID: "a0l4U00001c7x5mQAA",
    listingId: "a0W4U00000KnJOuUAN",
    description:
      "For households in which at least one member holds a Certificate of Preference from the former San Francisco Redevelopment Agency. COP holders were displaced by Agency action generally during the 1960s and 1970s.",
    appTotal: null,
    customPreferenceDescription: false,
  },
  {
    unitsAvailable: 1,
    requiresProof: false,
    readMoreUrl: "https://www.sf.gov/learn-about-displaced-tenant-housing-preference-dthp",
    preferenceProofRequirementDescription: null,
    preferenceName: "Displaced Tenant Housing Preference (DTHP)",
    pdfUrl: null,
    order: 2,
    NRHPDistrict: null,
    name: "LP-399932",
    listingPreferenceID: "a0l4U00001c7x5rQAA",
    listingId: "a0W4U00000KnJOuUAN",
    description:
      "For households in which at least one member holds a Displaced Tenant Housing Preference Certificate. DTHP Certificate holders are tenants who were evicted through either an Ellis Act Eviction or an Owner Move In Eviction, have been displaced by a fire, or who will experience an unaffordable rent increase due to affordability restrictions expiring. Once all units reserved for this preference are filled, remaining DTHP holders will receive Live/Work preference, regardless of their current residence or work location.",
    appTotal: null,
    customPreferenceDescription: false,
  },
  {
    unitsAvailable: 6,
    requiresProof: false,
    readMoreUrl: "https://www.sf.gov/get-priority-housing-lottery",
    preferenceProofRequirementDescription: null,
    preferenceName: "Live or Work in San Francisco Preference",
    pdfUrl: null,
    order: 3,
    NRHPDistrict: null,
    name: "LP-399933",
    listingPreferenceID: "a0l4U00001c7x5wQAA",
    listingId: "a0W4U00000KnJOuUAN",
    description:
      "This is a custom description - For households in which at least one member lives or works in San Francisco.  Requires submission of proof.  Please note in order to claim Work Preference, the applicant currently work in San Francisco at least 75% of their working hours.",
    appTotal: null,
    customPreferenceDescription: true,
  },
]
