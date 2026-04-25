// cypress/e2e/shortForm/preferences/nrhp.e2e.ts
// Migrated from: spec/e2e/features/short_form/nrhp.feature
// Requirements: 7.1, 7.2, 7.3, 7.4

import {
  fillNamePage,
  fillContactPage,
  indicateLivingAlone,
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
  uploadPreferenceProof,
  clickNext,
  navigateToSection,
  confirmHouseholdMemberAddress,
} from "../../../support/pages/shortForm"
import { createTestAccount, LISTING_IDS } from "../../../support/helpers/testData"

const SHOW_VETERANS_QUESTION = false

describe("Short Form Application - Neighborhood Resident Housing Preference", () => {
  // ─── Scenario 1: Address outside NRHP area ───
  it("Using an address outside the NRHP area, I should not see the preference option", () => {
    const account = createTestAccount("Jeremy Doe")

    cy.visit(`/listings/${LISTING_IDS.test}/apply/name`)

    // Name page
    fillNamePage({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // Contact page — non-NRHP address, WorkInSF
    fillContactPage({ workInSf: "yes" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Live alone
    indicateLivingAlone()

    // Public housing
    indicateLivingInPublicHousing()

    // No ADA priority
    indicateNoAdaPriority()

    // Vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("50000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing
    optOutOfPreference()

    // The first live/work/neighborhood preference should be Live/Work (not NRHP)
    cy.get(".form-label").should("contain.text", "Live or Work in San Francisco Preference")
  })

  // ─── Scenario 2: Address inside NRHP area ───
  it("Using an address inside the NRHP area, I should see the preference option", () => {
    const account = createTestAccount("Jeremy Doe")

    cy.visit(`/listings/${LISTING_IDS.test}/apply/name`)

    // Name page
    fillNamePage({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // Contact page — NRHP address (1222 Harrison St.), WorkInSF
    fillContactPage({ address1: "1222 Harrison St.", workInSf: "yes" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Living with other people
    indicateLivingWithOthers()
    clickNext()

    // Add household member "Karen Lee" who lives at a different (non-NRHP) address
    cy.get("#add-household-member").click()
    addHouseholdMember({
      firstName: "Karen",
      lastName: "Lee",
      address1: "4053 18th St.",
      city: "San Francisco",
      sameAddress: false,
    })
    confirmHouseholdMemberAddress()

    // Add household member "Jonny Doe" with same address as primary
    cy.get("#add-household-member").click()
    addHouseholdMember({
      firstName: "Jonny",
      lastName: "Doe",
      sameAddress: true,
    })

    // Done adding people
    indicateBeingDoneAddingPeople()

    // Public housing
    indicateLivingInPublicHousing()

    // No ADA priority
    indicateNoAdaPriority()

    // Vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("50000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing
    optOutOfPreference()

    // The first preference should be "Live in the Neighborhood"
    cy.get(".form-label").should("contain.text", "Live in the Neighborhood")

    // Click NRHP checkbox
    cy.get("#preferences-neighborhoodResidence").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })

    // Verify eligible members in dropdown (Jeremy Doe, Jonny Doe) and not Karen Lee
    cy.get("option").filter(":visible").contains("Jeremy Doe").should("exist")
    cy.get("option").filter(":visible").contains("Jonny Doe").should("exist")
    cy.get("option").filter(":visible").contains("Karen Lee").should("not.exist")

    // Select Jonny Doe for NRHP
    selectPreference("neighborhoodResidence", "Jonny Doe")

    // Go back to Household page and change Jonny's address to non-NRHP
    navigateToSection("Household")
    // Edit last household member (Jonny)
    cy.get(".edit-link").filter(":visible").contains("Edit").last().click()
    // Change their address to a non-NRHP address
    cy.get("#hasSameAddressAsApplicant_no").click()
    cy.get("#householdMember_home_address_address1").clear().type("4053 18th St.")
    cy.get("#householdMember_home_address_city").clear().type("San Francisco")
    cy.get("#householdMember_home_address_state").select("California")
    cy.get("#householdMember_home_address_zip").clear().type("94114")
    cy.get("#workInSf_no").click()
    cy.get('[ng-model="householdMember.relationship"]').select("Cousin")
    cy.get("#submit").click()
    confirmHouseholdMemberAddress()
    indicateBeingDoneAddingPeople()
    indicateLivingInPublicHousing()

    // Hit Next 4 times (ADA, vouchers, income, lottery intro)
    clickNext() // ADA
    clickNext() // ADA submit
    clickNext() // vouchers
    clickNext() // income

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing
    optOutOfPreference()

    // NRHP checkbox should be un-checked (Jonny changed address)
    cy.get("#preferences-neighborhoodResidence").should("not.be.checked")

    // Click NRHP checkbox
    cy.get("#preferences-neighborhoodResidence").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })

    // Jeremy Doe should still be eligible, Jonny Doe and Karen Lee should not
    cy.get("option").filter(":visible").contains("Jeremy Doe").should("exist")
    cy.get("option").filter(":visible").contains("Jonny Doe").should("not.exist")
    cy.get("option").filter(":visible").contains("Karen Lee").should("not.exist")

    // Uncheck NRHP so we can re-select it properly
    cy.get("#preferences-neighborhoodResidence").then(($el) => {
      if ($el.is(":checked")) cy.wrap($el).click()
    })

    // Select Jeremy Doe for NRHP
    selectPreference("neighborhoodResidence", "Jeremy Doe")

    // Upload proof
    uploadPreferenceProof("neighborhoodResidence", "School record")

    // Click Next on the Live in the Neighborhood page
    clickNext()

    // Opt out of Alice Griffith
    optOutOfPreference()

    // Don't choose COP-DTHP preferences
    clickNext()

    // Veterans
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_no").click()
      cy.get("#submit").click()
    }

    // Fill demographic survey
    fillDemographicSurvey()

    // Verify "Neighborhood Resident Housing Preference" claimed for "Jeremy Doe"
    cy.get(".info-item_name").should("contain.text", "Neighborhood Resident Housing Preference")
    cy.get(".info-item_note").should("contain.text", "Jeremy Doe")
  })
})
