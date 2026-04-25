// cypress/e2e/shortForm/preferences/assistedHousing.e2e.ts
// Migrated from: spec/e2e/features/short_form/assisted_housing.feature
// Requirements: 9.1, 9.2, 9.3

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
  selectPreference,
  selectAssistedHousingPreference,
  uploadAssistedHousingProof,
  confirmReviewDetails,
  agreeToTermsAndSubmit,
  clickNext,
} from "../../../support/pages/shortForm"
import { createTestAccount, LISTING_IDS } from "../../../support/helpers/testData"

const SHOW_VETERANS_QUESTION = false

describe("Short Form Application - Assisted Housing Preference", () => {
  // ─── Scenario: Claiming Assisted Housing preference ───
  it("Claiming Assisted Housing preference", () => {
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

    // Should see the Assisted Housing preference checkbox
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Assisted Housing Preference")

    // Select Assisted Housing Preference
    selectAssistedHousingPreference()

    // Submit without uploading — should see error
    clickNext()
    cy.get(".alert-box").should(
      "contain.text",
      "Please complete uploading documents or select that you don't want this preference."
    )

    // Select "Jen Doe" for assistedHousing preference
    selectPreference("assistedHousing", "Jen Doe")

    // Upload a Copy of Lease as proof for Assisted Housing
    uploadAssistedHousingProof()

    // Continue past Assisted Housing
    clickNext()

    // Opt out of Live/Work
    optOutOfPreference()

    // Opt out of Alice Griffith
    optOutOfPreference()

    // Don't choose COP-DTHP preferences
    clickNext()

    // Veterans
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_no").click()
      cy.get("#submit").click()
    }

    // Continue past general lottery notice
    clickNext()

    // Fill demographic survey
    fillDemographicSurvey()

    // Confirm review details
    confirmReviewDetails()

    // Agree to terms and submit
    agreeToTermsAndSubmit()

    // Click to view submitted application
    cy.get("#view-app", { timeout: 10000 }).scrollIntoView().click()

    // Verify Assisted Housing preference claimed on submitted application
    cy.get("#review-assistedHousing .info-item_name").should(
      "contain.text",
      "Assisted Housing Preference"
    )
  })
})
