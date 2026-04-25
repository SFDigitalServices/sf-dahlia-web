// cypress/e2e/shortForm/preferences/veterans.e2e.ts
// Migrated from: spec/e2e/features/short_form/veterans_preference.feature
// Requirements: 10.1, 10.2

import {
  fillNamePage,
  fillContactPage,
  indicateLivingWithOthers,
  addHouseholdMember,
  indicateBeingDoneAddingPeople,
  indicateLivingInPublicHousing,
  indicateNoAdaPriority,
  indicateHavingVouchers,
  fillIncomePage,
  fillDemographicSurvey,
  optOutOfPreference,
  selectVeteransPreference,
  confirmReviewDetails,
  agreeToTermsAndSubmit,
  clickNext,
} from "../../../support/pages/shortForm"
import { createTestAccount, LISTING_IDS } from "../../../support/helpers/testData"

// NOTE: The Protractor suite has showVeteransApplicationQuestion = false,
// meaning veterans tests are conditionally skipped. We still create the test
// file for when the flag is enabled. Toggle this constant to enable/disable.
const SHOW_VETERANS_QUESTION = false

describe("Short Form Application - Veterans Preference", () => {
  // ─── Scenario: Claiming Veterans Preference ───
  it("Claiming Veterans Preference", () => {
    const account = createTestAccount("Jen Doe")

    cy.visit(`/listings/${LISTING_IDS.test}/apply/name`)

    // Name page
    fillNamePage({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // Contact page — non-NRHP address, no WorkInSF
    fillContactPage({ workInSf: "no" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Living with other people
    indicateLivingWithOthers()
    clickNext()

    // Add household member "Jonny Doe" with same address as primary
    cy.get("#add-household-member").click()
    addHouseholdMember({
      firstName: "Jonny",
      lastName: "Doe",
      sameAddress: true,
    })
    indicateBeingDoneAddingPeople()

    // Living in public housing
    indicateLivingInPublicHousing()

    // No ADA priority
    indicateNoAdaPriority()

    // Vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("35000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing
    optOutOfPreference()

    // Opt out of Live/Work
    optOutOfPreference()

    // Opt out of Alice Griffith
    optOutOfPreference()

    // Don't choose COP-DTHP preferences
    clickNext()

    // Answer "Yes" to Veterans preference question and select "Jen Doe"
    if (SHOW_VETERANS_QUESTION) {
      selectVeteransPreference("Jen Doe")
      clickNext()
    }

    // Conditionally continue past the general lottery notice page
    if (!SHOW_VETERANS_QUESTION) {
      clickNext()
    }

    // Fill demographic survey
    fillDemographicSurvey()

    // Confirm review details
    confirmReviewDetails()

    // Agree to terms and submit
    agreeToTermsAndSubmit()

    // Click to view submitted application
    cy.get("#view-app", { timeout: 10000 }).scrollIntoView().click()

    // Verify Veterans preference claimed for "Jen Doe" on submitted application
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#review-veterans .info-item_name").should("contain.text", "Yes, someone is a veteran")
      cy.get("#review-veterans .info-item_note").should(
        "contain.text",
        `for ${account.firstName} Doe`
      )
    }
  })
})
