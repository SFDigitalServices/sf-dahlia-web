import type { RailsListingPreference } from "../../../api/types/rails/listings/RailsListingPreferences"

// Listings always have COP, DHTP and L/W
export const preferences: RailsListingPreference[] = [
  {
    unitsAvailable: 6,
    requiresProof: true,
    readMoreUrl: "https://www.sf.gov/certain-buildings-have-special-lottery-preferences",
    preferenceName: "Right to Return - Sunnydale",
    order: 1,
    name: "LP-399931",
    listingPreferenceID: "a0l4U00001c7x5mQAA",
    listingId: "a0W4U00000KnJOuUAN",
    description: "Test Custom Description",
    customPreferenceDescription: true,
    NRHPDistrict: "",
    appTotal: 0,
    pdfUrl: "",
    preferenceProofRequirementDescription: "",
  },
]
