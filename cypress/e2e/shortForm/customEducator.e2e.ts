// cypress/e2e/shortForm/customEducator.e2e.ts
// Migrated from: spec/e2e/features/short_form/custom_educator_listing_1.feature
//                spec/e2e/features/short_form/custom_educator_listing_2.feature
// Requirements: 11.1, 11.2, 11.3, 11.4

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
  fillScreeningQuestion,
  fillJobClassificationNumber,
  VALID_JOB_CODE,
} from "../../support/pages/shortForm"
import { createTestAccount, LISTING_IDS, TestAccount } from "../../support/helpers/testData"

const SHOW_VETERANS_QUESTION = false

/**
 * Helper: fill the full application from the welcome overview through submission.
 * Assumes we are on the welcome overview page (after screening).
 */
function fillFullApplication(account: TestAccount): void {
  // Continue past the welcome overview
  clickNext()

  // Name page
  fillNamePage({
    firstName: account.firstName,
    middleName: "",
    lastName: account.lastName,
    email: account.email,
  })
  clickNext()

  // Contact page — default address (non-NRHP), workInSf=yes
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
}

describe("Custom Educator Listing 1", () => {
  const account: TestAccount = createTestAccount("Jane Doe")

  // Handle AngularJS app errors that are not test failures
  beforeEach(() => {
    cy.on("uncaught:exception", () => false)
  })

  it("Yes to SFUSD with invalid job code then valid job code", () => {
    // Go to welcome page of Custom Educator 1 listing
    cy.visit(`/listings/${LISTING_IDS.customEducator1}/apply-welcome/intro`)

    // Select English
    cy.get("#submit-en").click()

    // Verify screening question title
    cy.get("h2.app-card_question").should(
      "contain.text",
      "Do you work at San Francisco Unified School District?"
    )

    // Answer Yes
    fillScreeningQuestion("yes")

    // Fill invalid job code
    fillJobClassificationNumber("123INVALIDNUMBER")

    // Click Next twice
    clickNext()
    clickNext()

    // Verify Job Code error
    cy.get(".alert-box").should(
      "contain.text",
      "You'll need to resolve any errors before moving on."
    )
    cy.get(".error").should(
      "contain.text",
      "Job Code is incorrect. Check for mistakes and try again."
    )

    // Fill valid code
    fillJobClassificationNumber(VALID_JOB_CODE)
    clickNext()

    // Fill full application
    fillFullApplication(account)

    // Verify review page shows "Yes" for SFUSD and job code
    cy.get("#custom-educator-screening-answer").should("contain.text", "Yes")
    cy.get("#custom-educator-job-classification-number").should("contain.text", VALID_JOB_CODE)

    // Confirm and submit
    confirmReviewDetails()
    agreeToTermsAndSubmit()

    // Verify lottery number
    cy.get("#lottery_number").should("exist")
  })

  it("No to SFUSD", () => {
    // Go to welcome page
    cy.visit(`/listings/${LISTING_IDS.customEducator1}/apply-welcome/intro`)

    // Select English
    cy.get("#submit-en").click()

    // Answer No
    fillScreeningQuestion("no")

    // Click Next
    clickNext()

    // Verify notice
    cy.get(".alert-notice").should(
      "contain.text",
      "You must work at SF Unified School District to apply."
    )

    // Verify submit button is disabled
    cy.get("#submit").should("have.attr", "disabled")
  })
})

describe("Custom Educator Listing 2", () => {
  const account: TestAccount = createTestAccount("Jane Doe")

  beforeEach(() => {
    cy.on("uncaught:exception", () => false)
  })

  it("Yes to SFUSD", () => {
    // Go to welcome page of Custom Educator 2 listing
    cy.visit(`/listings/${LISTING_IDS.customEducator2}/apply-welcome/intro`)

    // Select English
    cy.get("#submit-en").click()

    // Verify screening question title
    cy.get("h2.app-card_question").should(
      "contain.text",
      "Do you work at San Francisco Unified School District?"
    )

    // Answer Yes
    fillScreeningQuestion("yes")

    // Fill invalid job code first (to match feature file)
    fillJobClassificationNumber("123INVALIDNUMBER")
    clickNext()
    clickNext()

    // Verify Job Code error
    cy.get(".alert-box").should(
      "contain.text",
      "You'll need to resolve any errors before moving on."
    )
    cy.get(".error").should(
      "contain.text",
      "Job Code is incorrect. Check for mistakes and try again."
    )

    // Fill valid code
    fillJobClassificationNumber(VALID_JOB_CODE)
    clickNext()

    // Fill full application
    fillFullApplication(account)

    // Verify review page shows "Yes" for SFUSD and job code
    cy.get("#custom-educator-screening-answer").should("contain.text", "Yes")
    cy.get("#custom-educator-job-classification-number").should("contain.text", VALID_JOB_CODE)

    // Confirm and submit
    confirmReviewDetails()
    agreeToTermsAndSubmit()

    // Verify lottery number
    cy.get("#lottery_number").should("exist")
  })

  it("No to SFUSD", () => {
    // Go to welcome page
    cy.visit(`/listings/${LISTING_IDS.customEducator2}/apply-welcome/intro`)

    // Select English
    cy.get("#submit-en").click()

    // Answer No
    fillScreeningQuestion("no")

    // Verify note "You are not in a priority group."
    cy.get(".form-note span").should("contain.text", "You are not in a priority group.")

    // Click Next — can still proceed
    clickNext()

    // Fill full application
    fillFullApplication(account)

    // Verify review page shows "No" for SFUSD
    cy.get("#custom-educator-screening-answer").should("contain.text", "No")

    // Confirm and submit
    confirmReviewDetails()
    agreeToTermsAndSubmit()

    // Verify lottery number
    cy.get("#lottery_number").should("exist")
  })
})
