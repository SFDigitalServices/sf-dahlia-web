// cypress/e2e/shortForm/seniorListing.e2e.ts
// Migrated from: spec/e2e/features/short_form/error_messages.feature (Scenario 2 — senior listing)
// Requirements: 4.1, 4.2, 4.3, 4.4

import {
  fillNamePage,
  fillContactPage,
  clickNext,
  indicateLivingWithOthers,
  addHouseholdMember,
  indicateBeingDoneAddingPeople,
} from "../../support/pages/shortForm"

describe("Senior Listing Application", { testIsolation: false }, () => {
  it("Applicant too young for senior listing", () => {
    // Go to senior listing (community screening page)
    cy.goToApplication("senior")

    // Answer "Yes" to community screening question
    cy.get("#answeredCommunityScreening_yes").click()
    cy.get("#submit").click()

    // Continue past welcome overview
    clickNext()

    // Fill Name page with young DOB (1/1/2000)
    fillNamePage({
      firstName: "E2ETEST-Alice",
      lastName: "Youngblood",
      middleName: "",
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
    })
    clickNext()

    // Verify senior notice
    cy.get(".alert-notice").should("contain.text", "Everyone in your household must be a Senior")
  })

  it("Applicant qualifies for senior listing", () => {
    // Fill Name page with qualifying DOB (1/1/1950)
    fillNamePage({
      firstName: "E2ETEST-Alice",
      lastName: "Oldblood",
      middleName: "",
      dobMonth: "1",
      dobDay: "1",
      dobYear: "1950",
    })
    clickNext()

    // Should be on Contact page
    cy.url().should("contain", "apply/contact")
  })

  it("Household member too young", () => {
    // Fill Contact page
    fillContactPage()
    clickNext()

    // Confirm address
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Indicate living with other people
    indicateLivingWithOthers()
    clickNext()

    // Add household member with young DOB
    cy.get("#add-household-member").click()
    addHouseholdMember({
      firstName: "Younger",
      lastName: "sibling",
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
      sameAddress: true,
    })

    // Click Next — should see senior notice
    clickNext()
    cy.get(".alert-notice").should("contain.text", "Everyone in your household must be a Senior")
  })

  it("Household member qualifies", () => {
    // Cancel the young member
    cy.get("#cancel-member").click()

    // Add household member with qualifying DOB
    cy.get("#add-household-member").click()
    addHouseholdMember({
      firstName: "Older",
      lastName: "sibling",
      dobMonth: "1",
      dobDay: "1",
      dobYear: "1945",
      sameAddress: true,
    })

    // Indicate done adding people
    indicateBeingDoneAddingPeople()

    // Should be on Priorities page
    cy.url().should("contain", "priorities")
  })
})
