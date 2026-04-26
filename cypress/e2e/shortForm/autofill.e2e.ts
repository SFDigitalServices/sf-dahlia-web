// cypress/e2e/shortForm/autofill.e2e.ts
// Migrated from: spec/e2e/features/short_form/autofill.feature
// Requirements: 12.1, 12.2, 12.3

import {
  fillNamePage,
  fillContactPage,
  indicateLivingAlone,
  indicateLivingInPublicHousing,
  indicateNoAdaPriority,
  indicateHavingVouchers,
  fillIncomePage,
  fillDemographicSurvey,
  confirmReviewDetails,
  agreeToTermsAndSubmit,
  optOutOfPreference,
  clickNext,
  clickNextTimes,
} from "../../support/pages/shortForm"
import {
  createTestAccount,
  createAccountViaUI,
  LISTING_IDS,
  TestAccount,
} from "../../support/helpers/testData"

const SHOW_VETERANS_QUESTION = false

describe("Autofill application", { testIsolation: false }, () => {
  const account: TestAccount = createTestAccount("Arnold Autofill", "1/1/1950")

  // ── Setup: create and confirm account ──
  before(() => {
    createAccountViaUI(account)
    // Clear session so the first test starts logged out — the Angular short-form
    // needs to detect the email on the name page and show the welcome-back sign-in.
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  // ─── Scenario 1: Creating base application for autofill ───
  it("Creating base application for autofill", () => {
    // Go to senior listing
    cy.goToApplication("senior")

    // Answer Yes to community screening
    cy.get("#answeredCommunityScreening_yes").click()
    cy.get("#submit").click()

    // Continue past welcome overview
    clickNext()

    // Fill Name page as Arnold Autofill
    fillNamePage({
      firstName: account.firstName,
      middleName: "",
      lastName: account.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "1950",
      email: account.email,
    })
    clickNext()

    // Should see "Welcome back!" title
    cy.get("h2.app-card_question").should("contain.text", "Welcome back!")

    // Sign in with email pre-filled (email is locked, only password needed)
    cy.get("#auth_password").clear().type(account.password)
    cy.get("#sign-in").click()

    // Should be signed in
    cy.get('nav a[href="/my-account"]').should("contain.text", "My Account")

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Click Next (Name page pre-filled)
    clickNext()

    // Fill Contact page
    fillContactPage()
    clickNext()

    // Address confirmation
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Live alone
    indicateLivingAlone()

    // No ADA priority
    indicateNoAdaPriority()

    // Having vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("25000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Live/Work preference
    optOutOfPreference()

    // Don't choose COP-DTHP preferences
    clickNext()

    // Veterans preference — answer No (if shown)
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_no").click()
      cy.get("#submit").click()
    }

    // Continue past general lottery notice page
    clickNext()

    // Fill demographic survey
    fillDemographicSurvey()

    // Confirm review details
    confirmReviewDetails()

    // Agree to terms and submit
    agreeToTermsAndSubmit()

    // Verify lottery number
    cy.get("#lottery_number").should("exist")
  })

  // ─── Scenario 2: Autofill prompt displayed ───
  it("Autofill prompt displayed", () => {
    // Go to test listing (first page)
    cy.visit(`/listings/${LISTING_IDS.test}/apply/name`)

    // Verify autofill prompt
    cy.get("h2.app-card_question").should(
      "contain.text",
      "Save time by using the details from your last application."
    )
  })

  // ─── Scenario 3: Autofill pre-populates data ───
  it("Autofill pre-populates data", () => {
    // Click "Start with these details"
    cy.get("#start_with_autofill").click()

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Click Next twice (Name and Contact pre-filled)
    clickNextTimes(2)

    // Confirm address
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Live alone
    indicateLivingAlone()

    // Living in public housing
    indicateLivingInPublicHousing()

    // ADA already filled — click Next
    clickNext()

    // Vouchers and income pre-filled — click Next twice
    clickNextTimes(2)

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing preference
    optOutOfPreference()

    // Click Next twice (past Live/Work sub-pages)
    clickNextTimes(2)

    // Opt out of Alice Griffith preference
    optOutOfPreference()

    // Opt out of Live/Work preference
    optOutOfPreference()

    // Don't choose COP-DTHP preferences
    clickNext()

    // Veterans preference — answer No (if shown)
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_no").click()
      cy.get("#submit").click()
    }

    // Continue past general lottery notice page
    clickNext()

    // Should land on the optional survey page
    cy.get("h2.app-card_question", { timeout: 15000 }).should("contain.text", "Help us ensure we are meeting our goal")
  })

  // ─── Scenario 4: Autofilled application submission ───
  it("Autofilled application submission", () => {
    // Fill demographic survey (scenario 3 left us on the survey page)
    fillDemographicSurvey()

    // Confirm review details
    confirmReviewDetails()

    // Agree to terms and submit
    agreeToTermsAndSubmit()

    // Verify lottery number
    cy.get("#lottery_number").should("exist")

    // Sign out without saving
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
    cy.contains("button", "Leave").click()
  })
})
