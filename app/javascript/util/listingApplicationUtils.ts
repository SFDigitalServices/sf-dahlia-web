import type BaseRailsListing from "../api/types/rails/listings/BaseRailsListing"

export type ApplicationPageConfig = {
  section: string
  slug: string
}

export type ListingApplicationConfig = {
  pages: ApplicationPageConfig[]
}

const hasPreference = (listing: BaseRailsListing, name: string) =>
  listing.Listing_Lottery_Preferences?.some((pref) => pref.Lottery_Preference.Name === name)

const hasReservedUnitType = (listing: BaseRailsListing, name: string) =>
  listing.reservedDescriptor?.some((reservedDescriptor) => reservedDescriptor.name === name)

const hasVeteranPreference = (listing: BaseRailsListing) =>
  listing.Listing_Lottery_Preferences?.some((pref) => /veteran/i.test(pref.Lottery_Preference.Name))

const hasCustomPreferences = (listing: BaseRailsListing) =>
  listing.Listing_Lottery_Preferences?.some((pref) =>
    ["Treasure Island Resident (TIR) Preference"].includes(pref.Lottery_Preference.Name)
  )

export const generateListingApplicationConfig = (
  listing: BaseRailsListing
): ListingApplicationConfig => {
  const pages: ApplicationPageConfig[] = []

  if (
    [
      "Educator 1: SFUSD employees only",
      "Educator 2: SFUSD employees & public",
      "Educator 3: Waitlist - SFUSD employees & public",
    ].includes(listing.Custom_Listing_Type)
  ) {
    pages.push({ section: "screening", slug: "custom-educator-screening" })
  } else if (listing.Reserved_community_type) {
    pages.push({ section: "screening", slug: "community-screening" })
  }

  pages.push(
    { section: "overview", slug: "overview" },
    // this page may skip itself if applicant is not logged in
    { section: "you", slug: "autofill-preview" }
  )

  if (["New sale", "Resale"].includes(listing.Tenure)) {
    pages.push({ section: "qualify", slug: "prequisites" })
  }

  // if (!"applicant is logged out and email matches an account") {
  //   pages.push({ section: "you", slug: "welcome-back" })
  // }

  pages.push(
    // this page may skip itself if applicant is logged in
    { section: "you", slug: "name" },
    { section: "you", slug: "contact" },
    // this page will manage flows between some other pages
    { section: "you", slug: "alternate-contact-type" },
    { section: "household", slug: "household-intro" }
  )

  // this page will manage flows between some other pages
  if (hasPreference(listing, "assistedHousing")) {
    pages.push({ section: "household", slug: "household-public-housing" })
  }

  if (hasReservedUnitType(listing, "Veteran")) {
    pages.push({ section: "household", slug: "household-reserved-units-veteran" })
  }

  if (hasReservedUnitType(listing, "Developmental disabilities")) {
    pages.push({ section: "household", slug: "household-reserved-units-disabled" })
  }

  if (
    listing.Tenure === "New rental" ||
    listing.Tenure === "Re-rental" ||
    listing.Reserved_community_type === "Accessible Units Only"
  ) {
    pages.push({ section: "household", slug: "household-priorities" })
  }

  if (listing.Tenure === "New rental" || listing.Tenure === "Re-rental") {
    pages.push({ section: "household", slug: "income-vouchers" })
  }

  pages.push(
    { section: "income", slug: "income" },
    { section: "preferences", slug: "preferences-intro" }
  )

  if (hasPreference(listing, "assistedHousing")) {
    pages.push({ section: "preferences", slug: "assisted-housing-preference" })
  } else if (hasPreference(listing, "rentBurden")) {
    // this page may skip itself due to income data
    pages.push({ section: "preferences", slug: "rent-burdened-preference" })
  }

  // this page may skip itself due to address data
  if (hasPreference(listing, "neighborhoodResidence")) {
    pages.push({ section: "preferences", slug: "neighborhood-preference" })
  }

  // this page may skip itself due to address data
  if (hasPreference(listing, "liveWorkInSf")) {
    pages.push({ section: "preferences", slug: "live-work-preference" })
  }

  // this page may skip itself due to address data
  // this page will manage flow to another verify-address page
  if (hasPreference(listing, "aliceGriffith") || hasPreference(listing, "rightToReturnSunnydale")) {
    pages.push({ section: "preferences", slug: "right-to-return-preference" })
  }

  pages.push({ section: "preferences", slug: "preference-programs" })

  if (hasVeteranPreference(listing)) {
    pages.push({ section: "preferences", slug: "veterans-preference" })
  }

  if (hasCustomPreferences(listing)) {
    pages.push({ section: "preferences", slug: "custom-preferences" })
  }

  pages.push(
    // this page may skip itself due to absence of any selected preferences
    { section: "preferences", slug: "general-lottery-notice" },
    { section: "review", slug: "review-optional" },
    { section: "review", slug: "review-summary" },
    { section: "review", slug: "review-terms" },
    { section: "confirmation", slug: "confirmation" }
  )

  return { pages }
}
