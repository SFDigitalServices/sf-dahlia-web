// cypress/e2e/shortForm/preferences/rentBurden.e2e.ts
// Migrated from: spec/e2e/features/short_form/rent_burden.feature
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6

import {
  fillNamePage,
  fillContactPage,
  indicateLivingWithOthers,
  openHouseholdMemberForm,
  addHouseholdMember,
  indicateBeingDoneAddingPeople,
  indicateNotLivingInPublicHousing,
  indicateNoAdaPriority,
  indicateHavingVouchers,
  fillIncomePage,
  fillDemographicSurvey,
  optOutOfPreference,
  selectRentBurdenPreference,
  uploadRentBurdenProof,
  clickNext,
  navigateToSection,
  confirmHouseholdMemberAddress,
} from "../../../support/pages/shortForm"
import { createTestAccount, LISTING_IDS } from "../../../support/helpers/testData"

const SHOW_VETERANS_QUESTION = false

describe("Short Form Application - Rent Burdened Preference", () => {
  // ─── Scenario: Being eligible for Rent Burdened preference with a single address ───
  it("Being eligible for Rent Burdened preference with a single address", () => {
    const account = createTestAccount("Jane Doe")

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

    // Living with other people
    indicateLivingWithOthers()
    clickNext()

    // Add household member "Jonny Doe" with same address as primary
    openHouseholdMemberForm()
    addHouseholdMember({
      firstName: "Jonny",
      lastName: "Doe",
      sameAddress: true,
    })
    indicateBeingDoneAddingPeople()

    // Not living in public housing
    indicateNotLivingInPublicHousing()

    // Enter monthly rents — single address, one rent input
    cy.get(".form-income_input").each(($el) => {
      cy.wrap($el).clear().type("2000")
    })
    clickNext()

    // No ADA priority
    indicateNoAdaPriority()

    // Vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("35000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Should see the Rent Burdened preference checkbox
    cy.get("strong.form-label").filter(":visible").should("contain.text", "Rent Burdened")

    // Select Rent Burdened Preference
    selectRentBurdenPreference()

    // Should see proof uploaders for rent burden files
    cy.get('[ng-model="$ctrl.proofDocument.file.name"]').should("exist")

    // ── Error: no file(s) uploaded ──
    clickNext()
    cy.get(".alert-box").should(
      "contain.text",
      "Please complete uploading documents or select that you don't want this preference."
    )

    // ── Successful upload for single address ──
    uploadRentBurdenProof("Money order")

    // Upload additional "Cancelled check" proof
    cy.get("#upload-additional-proof").click()
    cy.get("#rentBurden_rentDocument").filter(":visible").first().select("Cancelled check")
    cy.get("#ngf-rentBurden_rentFile").selectFile("app/assets/images/logo-city.png", {
      force: true,
    })

    // Wait for both uploads to complete before proceeding
    cy.get("#uploaded-ngf-rentBurden_leaseFile").filter(":visible").should("exist")
    cy.get("#uploaded-ngf-rentBurden_rentFile").filter(":visible").should("exist")

    clickNext()

    // Should see Live/Work preference next
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // ── Change primary applicant address — clears preference ──
    navigateToSection("You")
    clickNext()

    // Change to NRHP address
    fillContactPage({ address1: "1222 Harrison St.", workInSf: "yes" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Done adding people
    indicateBeingDoneAddingPeople()

    // Not living in public housing
    indicateNotLivingInPublicHousing()

    // Enter monthly rents
    cy.get(".form-income_input").each(($el) => {
      cy.wrap($el).clear().type("2000")
    })
    clickNext()

    // No ADA priority
    indicateNoAdaPriority()

    // Vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("35000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Rent Burdened checkbox should be un-checked
    cy.get("#preferences-rentBurden").should("not.be.checked")

    // ── Change household member address — clears preference ──
    // Select the checkbox so we can see it get un-checked
    selectRentBurdenPreference()

    // Go back to Household page
    navigateToSection("Household")

    // Edit last household member (Jonny)
    cy.get(".edit-link").filter(":visible").contains("Edit").last().click()

    // Change their address to a different address
    cy.get("#hasSameAddressAsApplicant_no").click()
    cy.get("#householdMember_home_address_address1").clear().type("2601 Mission St.")
    cy.get("#householdMember_home_address_city").clear().type("San Francisco")
    cy.get("#householdMember_home_address_state").select("California")
    cy.get("#householdMember_home_address_zip").clear().type("94114")
    cy.get("#workInSf_no").click()
    cy.get('[ng-model="householdMember.relationship"]').select("Cousin")
    cy.get("#submit").click()
    confirmHouseholdMemberAddress()
    indicateBeingDoneAddingPeople()

    // Not living in public housing
    indicateNotLivingInPublicHousing()

    // Enter monthly rents
    cy.get(".form-income_input").each(($el) => {
      cy.wrap($el).clear().type("2000")
    })
    clickNext()

    // No ADA priority
    indicateNoAdaPriority()

    // Vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("35000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Rent Burdened checkbox should be un-checked
    cy.get("#preferences-rentBurden").should("not.be.checked")

    // Select Rent Burdened again
    selectRentBurdenPreference()

    // Open first address in Rent Burden dashboard
    cy.get(".edit-link.info-item_link").filter(":visible").first().click()

    // Upload proof for first address
    uploadRentBurdenProof("Money order")

    // Indicate being done with this address
    clickNext()

    // Should see green checkmarks for first address
    cy.contains(".info-item_doc", "Copy of Lease").first().find(".i-check").should("exist")
    cy.contains(".info-item_doc", "Proof of Rent").first().find(".i-check").should("exist")

    // ── Error: no file(s) uploaded for 2nd address ──
    clickNext()
    cy.get(".alert-box").should(
      "contain.text",
      "Please complete uploading documents or select that you don't want this preference."
    )

    // Should see red X indicators for missing uploads on 2nd address
    cy.contains(".info-item_doc", "Copy of Lease").last().find(".i-close").should("exist")
    cy.contains(".info-item_doc", "Proof of Rent").last().find(".i-close").should("exist")

    // ── Upload proof for 2nd address ──
    cy.get(".edit-link.info-item_link").filter(":visible").last().click()
    uploadRentBurdenProof("Money order")
    clickNext()

    // Should see green checkmarks for both addresses
    cy.contains(".info-item_doc", "Copy of Lease").first().find(".i-check").should("exist")
    cy.contains(".info-item_doc", "Proof of Rent").first().find(".i-check").should("exist")

    // Continue past Rent Burdened
    clickNext()

    // Opt out of NRHP
    optOutOfPreference()

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

    // Fill demographic survey
    fillDemographicSurvey()

    // Verify Rent Burdened preference details on review page
    cy.get("#review-rentBurden .info-item_note").should("contain.text", "for 4053 18TH ST")
    cy.get("#review-rentBurden .info-item_note").should("contain.text", "for 2601 MISSION ST")
    cy.get("#review-rentBurden .info-item_note").should(
      "contain.text",
      "Copy of Lease and Money order attached"
    )
  })
})
