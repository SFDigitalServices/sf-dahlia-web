// cypress/e2e/shortForm/preferences/liveWork.e2e.ts
// Migrated from: spec/e2e/features/short_form/live_work.feature
// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8

import {
  fillNamePage,
  fillContactPage,
  indicateLivingAlone,
  indicateLivingWithOthers,
  openHouseholdMemberForm,
  addHouseholdMember,
  indicateBeingDoneAddingPeople,
  indicateLivingInPublicHousing,
  indicateNoAdaPriority,
  indicateHavingVouchers,
  fillIncomePage,
  fillDemographicSurvey,
  optOutOfPreference,
  uploadPreferenceProof,
  selectLiveWorkPreference,
  clickNext,
  navigateToSection,
  confirmHouseholdMemberAddress,
} from "../../../support/pages/shortForm"
import { createTestAccount, LISTING_IDS } from "../../../support/helpers/testData"

// NOTE: showVeteransApplicationQuestion is false in the Protractor suite
const SHOW_VETERANS_QUESTION = false

/**
 * Helper: Navigate to the Contact page by going to "You" section then clicking Next.
 */
function goBackToContactPage(): void {
  navigateToSection("You")
  clickNext()
}

/**
 * Helper: Navigate to the Live-Work preference page.
 * Goes to Preferences section, skips intro, skips Assisted Housing (if present),
 * and skips NRHP (if present).
 */
function goBackToLiveWorkPreferencePage(): void {
  navigateToSection("Preferences")
  // Skip intro
  clickNext()
  // Skip Assisted Housing or Rent Burdened (if exists)
  cy.get("body").then(($body) => {
    if (
      $body.find("#preferences-assistedHousing").length > 0 ||
      $body.find("#preferences-rentBurden").length > 0
    ) {
      clickNext()
    }
  })
  // Skip NRHP (if exists)
  cy.get("body").then(($body) => {
    if ($body.find("#preferences-neighborhoodResidence").length > 0) {
      clickNext()
    }
  })
}

describe("Short Form Application - Live-Work Preference", () => {
  // ─── Scenario 1: Applicant and/or household member living or working in SF, different combinations ───
  it("Applicant and/or household member living or working in SF, different combinations", () => {
    const account = createTestAccount("Jane Doe")

    cy.visit(`/listings/${LISTING_IDS.test}/apply/name`)

    // Name page
    fillNamePage({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // ── Neither live nor work in SF, alone ──
    fillContactPage({
      address1: "1120 Mar West G",
      city: "Tiburon",
      zip: "94920",
      workInSf: "no",
    })
    clickNext()

    // Confirm address
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

    // Opt out of Alice Griffith — should go straight to COP-DTHP (no Live/Work shown)
    optOutOfPreference()

    // Should see the Preferences Programs screen (COP-DTHP)
    cy.get("strong.form-label").should("contain.text", "Certificate of Preference (COP)")

    // ── I work but not live in SF, alone ──
    goBackToContactPage()
    cy.get("#workInSf_yes").click()
    clickNext()
    // Confirm address
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Work in San Francisco Preference")

    // ── I work and live in SF, alone ──
    goBackToContactPage()
    fillContactPage({ workInSf: "yes" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // Make sure the dropdowns are correct
    cy.get("#preferences-liveWorkInSf").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    cy.get("#liveWorkPrefOption").select("Live in San Francisco")
    cy.get("option").filter(":visible").contains("Jane Doe").should("exist")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("not.exist")

    cy.get("#liveWorkPrefOption").select("Work in San Francisco")
    cy.get("option").filter(":visible").contains("Jane Doe").should("exist")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("not.exist")

    // ── I live but not work in SF, alone ──
    goBackToContactPage()
    cy.get("#workInSf_no").click()
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live in San Francisco Preference")

    // ── I live in SF, household member lives in SF ──
    navigateToSection("Household")
    indicateLivingWithOthers()
    clickNext()

    openHouseholdMemberForm()
    addHouseholdMember({
      firstName: "Coleman",
      lastName: "Francis",
      address1: "4053 18th St.",
      city: "San Francisco",
      sameAddress: false,
    })
    confirmHouseholdMemberAddress()
    indicateBeingDoneAddingPeople()
    indicateLivingInPublicHousing()
    cy.get("#submit").click() // ADA
    cy.get("#submit").click() // ADA submit
    cy.get("#submit").click() // vouchers

    // Continue past Lottery Preferences intro
    clickNext()
    // Opt out of Assisted Housing
    optOutOfPreference()

    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live in San Francisco Preference")

    // ── I neither live nor work in SF, household member lives in SF ──
    goBackToContactPage()
    fillContactPage({
      address1: "1120 Mar West G",
      city: "Tiburon",
      workInSf: "no",
    })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live in San Francisco Preference")

    // ── I work in SF, household member lives in SF ──
    goBackToContactPage()
    cy.get("#workInSf_yes").click()
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // Make sure the dropdowns are correct
    cy.get("#preferences-liveWorkInSf").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    cy.get("#liveWorkPrefOption").select("Live in San Francisco")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("exist")
    cy.get("option").filter(":visible").contains("Jane Doe").should("not.exist")

    cy.get("#liveWorkPrefOption").select("Work in San Francisco")
    cy.get("option").filter(":visible").contains("Jane Doe").should("exist")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("not.exist")

    // ── I work and live in SF, household member lives in SF ──
    goBackToContactPage()
    fillContactPage({ workInSf: "yes" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // ── I work and live in SF, household member works in SF ──
    navigateToSection("Household")
    // Edit last household member
    cy.get(".edit-link").filter(":visible").contains("Edit").last().click()
    // Change them to live outside SF, work in SF
    cy.get("#hasSameAddressAsApplicant_no").click()
    cy.get("#householdMember_home_address_address1").clear().type("1120 Mar West G")
    cy.get("#householdMember_home_address_city").clear().type("Tiburon")
    cy.get("#householdMember_home_address_state").select("California")
    cy.get("#householdMember_home_address_zip").clear().type("94920")
    cy.get("#workInSf_yes").click()
    cy.get('[ng-model="householdMember.relationship"]').select("Cousin")
    cy.get("#submit").click()
    confirmHouseholdMemberAddress()
    indicateBeingDoneAddingPeople()
    indicateLivingInPublicHousing()
    cy.get("#submit").click() // ADA
    cy.get("#submit").click() // ADA submit
    cy.get("#submit").click() // vouchers

    clickNext() // Lottery Preferences intro
    optOutOfPreference() // Assisted Housing

    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // ── I work in SF, household member works in SF ──
    goBackToContactPage()
    fillContactPage({
      address1: "1120 Mar West G",
      city: "Tiburon",
      workInSf: "yes",
    })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Work in San Francisco Preference")

    // ── I live in SF, household member works in SF ──
    goBackToContactPage()
    fillContactPage({ workInSf: "no" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // Make sure the dropdowns are correct
    cy.get("#preferences-liveWorkInSf").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    cy.get("#liveWorkPrefOption").select("Live in San Francisco")
    cy.get("option").filter(":visible").contains("Jane Doe").should("exist")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("not.exist")

    cy.get("#liveWorkPrefOption").select("Work in San Francisco")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("exist")
    cy.get("option").filter(":visible").contains("Jane Doe").should("not.exist")

    // ── I neither work nor live in SF, household member works in SF ──
    goBackToContactPage()
    fillContactPage({
      address1: "1120 Mar West G",
      city: "Tiburon",
      workInSf: "no",
    })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Work in San Francisco Preference")

    // ── I neither work nor live in SF, household member lives and works in SF ──
    navigateToSection("Household")
    cy.get(".edit-link").filter(":visible").contains("Edit").last().click()
    // Change them to live inside SF, work in SF
    cy.get("#hasSameAddressAsApplicant_no").click()
    cy.get("#householdMember_home_address_address1").clear().type("4053 18th St.")
    cy.get("#householdMember_home_address_city").clear().type("San Francisco")
    cy.get("#householdMember_home_address_state").select("California")
    cy.get("#householdMember_home_address_zip").clear().type("94114")
    cy.get("#workInSf_yes").click()
    cy.get('[ng-model="householdMember.relationship"]').select("Cousin")
    cy.get("#submit").click()
    confirmHouseholdMemberAddress()
    indicateBeingDoneAddingPeople()
    indicateLivingInPublicHousing()
    cy.get("#submit").click() // ADA
    cy.get("#submit").click() // ADA submit
    cy.get("#submit").click() // vouchers

    clickNext() // Lottery Preferences intro
    optOutOfPreference() // Assisted Housing

    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // Make sure the dropdowns are correct
    cy.get("#preferences-liveWorkInSf").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    cy.get("#liveWorkPrefOption").select("Live in San Francisco")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("exist")
    cy.get("option").filter(":visible").contains("Jane Doe").should("not.exist")

    cy.get("#liveWorkPrefOption").select("Work in San Francisco")
    cy.get("option").filter(":visible").contains("Coleman Francis").should("exist")
    cy.get("option").filter(":visible").contains("Jane Doe").should("not.exist")

    // ── I work in SF, household member lives and works in SF ──
    goBackToContactPage()
    fillContactPage({
      address1: "1120 Mar West G",
      city: "Tiburon",
      workInSf: "yes",
    })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // ── I live in SF, household member lives and works in SF ──
    goBackToContactPage()
    fillContactPage({ workInSf: "no" })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    cy.get("strong.form-label")
      .filter(":visible")
      .should("contain.text", "Live or Work in San Francisco Preference")

    // ── Check that filling it out then changing required info removes from application ──
    selectLiveWorkPreference("Live in San Francisco", `${account.firstName} ${account.lastName}`)
    uploadPreferenceProof("liveInSf", "Gas bill")

    // Don't choose COP-DTHP preferences
    clickNext()

    // Skip Alice Griffith
    clickNext()

    // COP-DTHP
    clickNext()

    // Veterans
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_no").click()
      cy.get("#submit").click()
    }

    // Go back to Contact page and change to non-SF, no WorkInSF
    goBackToContactPage()
    fillContactPage({
      address1: "1120 Mar West G",
      city: "Tiburon",
      workInSf: "no",
    })
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    goBackToLiveWorkPreferencePage()
    // Preference should be un-checked
    cy.get("#preferences-liveWorkInSf").should("not.be.checked")

    // ── See general lottery notice ──
    // Opt out of Live/Work
    optOutOfPreference()
    // Opt out of Alice Griffith
    optOutOfPreference()
    // Don't choose COP-DTHP
    clickNext()

    // Veterans
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_no").click()
      cy.get("#submit").click()
    }

    // Continue past general lottery notice
    clickNext()

    // Fill survey
    fillDemographicSurvey()

    // Verify general lottery notice on review page
    cy.get(".info-item_name").should("contain.text", "You will be in the general lottery")
  })

  // ─── Scenario 2: Opting in to Live-Work then saying no to workInSf then uploading proof ───
  it("Opting in to Live-Work then saying no to workInSf then uploading proof", () => {
    const account = createTestAccount("Jane Doe")

    cy.visit(`/listings/${LISTING_IDS.test}/apply/name`)

    // Name page
    fillNamePage({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // Contact page — SF address, WorkInSF
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
    fillIncomePage("25000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing
    optOutOfPreference()

    // Select "Jane Doe" for "Live in San Francisco" in Live-Work preference
    selectLiveWorkPreference("Live in San Francisco", `${account.firstName} ${account.lastName}`)

    // Go back to Contact page and change WorkInSF to No
    goBackToContactPage()
    cy.get("#workInSf_no").click()
    clickNext()
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Go back to Live-Work preference page
    goBackToLiveWorkPreferencePage()

    // Should still see the single Live in San Francisco preference selected
    cy.get("#preferences-liveInSf", { timeout: 5000 }).should("be.checked")

    // Upload Gas bill proof
    uploadPreferenceProof("liveInSf", "Gas bill")

    // Verify successful file upload
    cy.get("#uploaded-liveInSf_proofFile").filter(":visible").should("exist")

    // Continue past Live-Work preference page
    clickNext()

    // Opt out of Alice Griffith
    optOutOfPreference()

    // Should see the Preferences Programs screen (COP-DTHP)
    cy.get("strong.form-label").should("contain.text", "Certificate of Preference (COP)")
  })

  // ─── Scenario 3: Selecting Live-Work member, going back and forth, changing name ───
  it("Selecting Live-Work member, going back and forth from previous page, changing name", () => {
    const account = createTestAccount("Jane Doe")

    cy.visit(`/listings/${LISTING_IDS.test}/apply/name`)

    // Name page
    fillNamePage({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // Contact page — NRHP address, WorkInSF
    fillContactPage({ address1: "1222 Harrison St.", workInSf: "yes" })
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
    fillIncomePage("25000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing
    optOutOfPreference()

    // Opt out of NRHP
    optOutOfPreference()

    // Select "Jane Doe" for "Live in San Francisco" in Live-Work preference
    selectLiveWorkPreference("Live in San Francisco", `${account.firstName} ${account.lastName}`)

    // Use browser back button
    cy.go("back")

    // Go back to Live-Work preference page
    goBackToLiveWorkPreferencePage()

    // Should still see the preference options and uploader input visible
    cy.get("#liveInSf_household_member").filter(":visible").should("exist")

    // Upload Gas bill proof
    uploadPreferenceProof("liveInSf", "Gas bill")

    // Continue past Live-Work preference page
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

    // Navigate to "You" section and change name
    navigateToSection("You")
    fillNamePage({
      firstName: "E2ETEST-Harper",
      middleName: "Valerie",
      lastName: "Lee",
    })
    clickNext()

    // Navigate to Review section
    navigateToSection("Review")

    // Fill survey again
    fillDemographicSurvey()

    // Verify "Live in San Francisco" preference claimed for "Harper Lee"
    cy.get(".info-item_name").should("contain.text", "Live in San Francisco")
    cy.get(".info-item_note").should("contain.text", "Harper Lee")
  })
})
