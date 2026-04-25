// cypress/e2e/shortForm/multilingual.e2e.ts
// Migrated from: spec/e2e/features/short_form/multilingual.feature
// Requirements: 13.1, 13.2, 13.3

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
} from "../../support/pages/shortForm"
import { createTestAccount, LISTING_IDS, TestAccount } from "../../support/helpers/testData"

const SHOW_VETERANS_QUESTION = false

describe("Multilingual application", { testIsolation: false }, () => {
  const account: TestAccount = createTestAccount("Janifer Doe")

  // ─── Scenario 1: Spanish language selection and non-English application submission ───
  it("Spanish language selection and non-English application submission", () => {
    // Go to welcome page of Test Listing
    cy.visit(`/listings/${LISTING_IDS.test}/apply-welcome/intro`)

    // Select Spanish
    cy.get("#submit-es").click()

    // Continue past welcome overview
    clickNext()

    // Verify "Español" in translate bar
    cy.get(".translate-bar li a.active").should("contain.text", "Español")

    // Fill Name page as "Janifer Doe"
    fillNamePage({
      firstName: account.firstName,
      middleName: "",
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // Fill Contact page with phoneType 'Casa' (Spanish for home)
    fillContactPage({ phoneType: "Casa" })
    clickNext()

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

    // No ADA priority
    indicateNoAdaPriority()

    // Having vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("25000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing preference
    optOutOfPreference()

    // Opt out of Live/Work preference
    optOutOfPreference()

    // Opt out of Alice Griffith preference
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

  // ─── Scenario 2: Filipino language for different listing ───
  it("Filipino language for different listing", () => {
    // Create account from confirmation page
    cy.get("#create-account").scrollIntoView().click()

    // Create account with pre-filled application details
    cy.get('input[name="email"]').clear().type(account.email)
    cy.get('input[name="password"]').clear().type(account.password)
    cy.get('input[name="password_confirmation"]').clear().type(account.password)
    cy.get('button[type="submit"]').click()

    // Should be on login page with email confirmation popup
    cy.get("#confirmation_needed").should("exist")

    // Confirm account
    cy.confirmAccountByEmail(account.email)

    // Go to Sign In page
    cy.visit("/sign-in")

    // Sign in as Janifer Doe
    cy.get("#auth_email").clear().type(account.email)
    cy.get("#auth_password").clear().type(account.password)
    cy.get("#sign-in").click()

    // Go to welcome page of Senior Test Listing
    cy.visit(`/listings/${LISTING_IDS.senior}/apply-welcome/intro`)

    // Select Filipino
    cy.get("#submit-tl").click()

    // Continue past welcome overview
    clickNext()

    // Wait for page to load
    cy.wait(1000)

    // Answer Yes to community screening
    cy.get("#answeredCommunityScreening_yes").click()
    cy.get("#submit").click()

    // Verify "Filipino" in translate bar
    cy.get(".translate-bar li a.active").should("contain.text", "Filipino")

    // Go back to welcome page and select English
    cy.visit(`/listings/${LISTING_IDS.senior}/apply-welcome/intro`)
    cy.get("#submit-en").click()

    // Sign out
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
  })
})
