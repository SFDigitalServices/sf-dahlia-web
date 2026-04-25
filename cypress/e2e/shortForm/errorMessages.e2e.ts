// cypress/e2e/shortForm/errorMessages.e2e.ts
// Migrated from: spec/e2e/features/short_form/error_messages.feature (Scenario 1 only)
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17

import {
  fillNamePage,
  fillContactPage,
  fillAlternateContactType,
  fillAlternateContactName,
  fillAlternateContactContact,
  indicateLivingWithOthers,
  openHouseholdMemberForm,
  addHouseholdMember,
  indicateBeingDoneAddingPeople,
  indicateLivingInPublicHousing,
  indicateNoAdaPriority,
  fillIncomePage,
  indicateNoVouchers,
  optOutOfPreference,
  selectLiveWorkPreference,
  selectPreference,
  uploadPreferenceProof,
  fillAliceGriffithAddress,
  clickNext,
  navigateToSection,
} from "../../support/pages/shortForm"
import { createTestAccount, TestAccount } from "../../support/helpers/testData"

describe("Short Form Application - Error Messages", () => {
  const account: TestAccount = createTestAccount("Jane Doe")

  // ─── Scenario 1: Seeing errors while filling out the form with missing or bad data ───
  it("Seeing errors while filling out the form with missing or bad data", () => {
    cy.goToApplication("test")

    // ── Name page errors ──

    // Error: not filling out the first page
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "Please enter a First Name")

    // Error: invalid DOB
    fillNamePage({
      firstName: "Jane",
      middleName: "Valerie",
      lastName: "Doe",
      dobMonth: "12",
      dobDay: "33",
      dobYear: "2099",
    })
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "Please enter a valid Date of Birth")

    // Error: invalid email
    fillNamePage({ email: "grant@exygy" })
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "Please enter an email address")

    // Error: non-latin characters
    cy.get('[ng-model="applicant.firstName"]').clear().type("Jane中文")
    cy.get("#submit").click()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "Please provide your answers in English")

    // Maxlength check: name should be truncated
    // The Protractor step uses account.fullName which has E2ETEST- prefix on firstName
    fillNamePage({
      firstName: "E2ETEST-Loremipsumloremipsumloremipsumloremipsumxyzxyz",
      middleName: "Loremipsumloremipsumloremipsumloremipsumxyzxyz",
      lastName: "Loremipsumloremipsumloremipsumloremipsumxyzxyz",
    })
    clickNext()
    navigateToSection("You")
    // Verify truncated name fields
    cy.get('[ng-model="applicant.firstName"]').should(
      "have.value",
      "E2ETEST-Loremipsumloremipsumloremipsumlo"
    )
    cy.get('[ng-model="applicant.middleName"]').should(
      "have.value",
      "Loremipsumloremipsum"
    )
    cy.get('[ng-model="applicant.lastName"]').should(
      "have.value",
      "Loremipsumloremipsumloremipsumloremipsum"
    )

    // Fill Name page normally to proceed
    navigateToSection("You")
    fillNamePage({
      firstName: account.firstName,
      middleName: "",
      lastName: account.lastName,
      email: account.email,
    })
    clickNext()

    // ── Contact page errors ──

    // Error: PO Box not allowed
    fillContactPage({
      address1: "P.O. Box 8097",
      city: "San Francisco",
      zip: "94128",
    })
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "PO Boxes are not allowed.")

    // Error: fake address (address not found)
    fillContactPage({
      address1: "1234 Test St",
      zip: "94920",
    })
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should(
      "contain.text",
      "This address was not found. Please check the house number, street, and city entered. PO Boxes are not allowed."
    )

    // Fill Contact page normally to proceed
    fillContactPage()
    clickNext()

    // Confirm address
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // ── Alternate Contact email error ──

    // Select alternate contact type Other
    fillAlternateContactType()
    clickNext()

    // Fill alternate contact name
    fillAlternateContactName()
    clickNext()

    // Error: invalid email in alternate contact
    fillAlternateContactContact({ email: "grant@exygy" })
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "Please enter an email address")

    // Fix email and continue
    fillAlternateContactContact({ email: "grant@exygy.com" })
    clickNext()

    // ── Household errors ──

    // Indicate living with other people (also skips past household-overview)
    indicateLivingWithOthers()
    clickNext()

    // Open household member form and submit empty
    openHouseholdMemberForm()
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "Please enter a First Name")

    // Cancel the household member
    cy.wait(1000) // match Protractor's browser.sleep(1000)
    cy.get("#cancel-member").click()

    // Add 3 household members to exceed max (listing allows 1-3 people, 4 is too big)
    cy.get("#add-household-member").click()
    addHouseholdMember({ firstName: "Jonny", lastName: "Doe", sameAddress: true })

    cy.get("#add-household-member").click()
    addHouseholdMember({ firstName: "Karen", lastName: "Lee", sameAddress: true })

    cy.get("#add-household-member").click()
    addHouseholdMember({ firstName: "Alex", lastName: "McGee", sameAddress: true })

    // Indicate done — should see household size error
    indicateBeingDoneAddingPeople()
    cy.get(".alert-box").should("contain.text", "Unfortunately it appears you do not qualify")
    cy.get(".c-alert").should("contain.text", "Your household size is too big")

    // Edit last member and cancel to remove them
    cy.get(".edit-link")
      .filter(":visible")
      .contains("Edit")
      .last()
      .click()
    cy.wait(1000)
    cy.get("#cancel-member").click()

    // Now should be valid with 3 people
    indicateBeingDoneAddingPeople()

    // ── Income errors ──

    // Living in public housing
    indicateLivingInPublicHousing()

    // No ADA priority
    indicateNoAdaPriority()

    // No vouchers
    indicateNoVouchers()

    // Error: income too low
    fillIncomePage("25000", "per-year")
    clickNext()
    cy.get(".alert-box").should("contain.text", "Unfortunately it appears you do not qualify")
    cy.get(".c-alert").should("contain.text", "Your household income is too low")

    // Error: income too high
    fillIncomePage("195000", "per-year")
    clickNext()
    cy.get(".alert-box").should("contain.text", "Unfortunately it appears you do not qualify")
    cy.get(".c-alert").should("contain.text", "Your household income is too high")

    // No error — income should pass
    fillIncomePage("75000", "per-year")
    clickNext()

    // ── Preference errors ──

    // Continue past Lottery Preferences intro
    clickNext()

    // Opt out of Assisted Housing preference
    optOutOfPreference()

    // Error: L/W preference option not chosen (optOut / preference both blank)
    clickNext()
    cy.get(".alert-box").should(
      "contain.text",
      "Please select and complete one of the options below in order to continue"
    )
    cy.get(".error").should("contain.text", "Please select one of the options above")

    // Error: preference document not uploaded
    selectLiveWorkPreference("Live in San Francisco", "Jane Doe")
    clickNext()
    cy.get(".alert-box").should(
      "contain.text",
      "Please complete uploading documents or select that you don't want this preference."
    )
    cy.get(".error").should("contain.text", "Please upload a valid document")

    // Error: uploaded preference document too large
    // Select the document type and upload a too-large file
    cy.get("#liveInSf_proofDocument").filter(":visible").first().select("Gas bill")
    cy.get('input[type="file"]')
      .filter(":visible")
      .first()
      .selectFile("spec/e2e/assets/sf-homes-wide.pdf", { force: true })
    cy.get(".error").should(
      "contain.text",
      "The file is too large or not a supported file type"
    )

    // Opt out of Live/Work preference
    optOutOfPreference()

    // Error: address not entered for Alice Griffith
    selectPreference("aliceGriffith", "Jane Doe")
    clickNext()
    cy.get(".error").should("contain.text", "Please enter an address")

    // Error: PO Box address for Alice Griffith
    uploadPreferenceProof("aliceGriffith", "Letter from SFHA verifying address")
    fillAliceGriffithAddress({
      address1: "P.O. Box 37176",
      city: "San Francisco",
      state: "CA",
      zip: "94114",
    })
    clickNext()
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "PO Boxes are not allowed.")
  })
})
