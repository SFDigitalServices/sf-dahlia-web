// cypress/e2e/shortForm/saleApplication.e2e.ts
// Migrated from: spec/e2e/features/short_form/navigating_sale_application.feature
// Requirements: 2.1, 2.2, 2.3

import {
  fillNamePage,
  fillContactPage,
  clickNext,
  indicateLivingAlone,
} from "../../support/pages/shortForm"

describe("Sale Listing Application", () => {
  it("Navigating through a sale listing application", () => {
    // Go to sale listing overview page
    cy.goToApplication("sale")

    // Click Next to get past the overview/welcome page to Prerequisites
    clickNext()

    // Wait for Prerequisites page to load (Protractor had a 5-second wait here)
    cy.url().should("contain", "prerequisites")

    // Check "completed homebuyer education" and submit — should show validation error
    // because other required fields are not filled
    cy.get("#application_has_completed_homebuyer_education").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    clickNext()

    // Verify prerequisites form validation error
    cy.get(".alert-box").should("exist")
    cy.get(".error").should("contain.text", "This field is required")

    // Fill in prerequisites form properly
    // Select first available option for lending institution
    cy.get("#lendingInstitution > option:nth-child(2)").then(($opt) => {
      cy.get("#lendingInstitution").select($opt.val() as string)
    })
    // Select first available option for lending agent
    cy.get("#lendingAgent > option:nth-child(2)").then(($opt) => {
      cy.get("#lendingAgent").select($opt.val() as string)
    })
    // Select first available option for homebuyer education agency
    cy.get("#homebuyerEducationAgency > option:nth-child(2)").then(($opt) => {
      cy.get("#homebuyerEducationAgency").select($opt.val() as string)
    })

    // Upload loan pre-approval and homebuyer education certificate
    cy.get('[id="ngf-Loan pre-approvalFile"]').selectFile("app/assets/images/logo-city.png", {
      force: true,
    })
    cy.get('[id="ngf-Homebuyer education certificateFile"]').selectFile(
      "app/assets/images/logo-city.png",
      { force: true }
    )

    // Check first time homebuyer checkbox
    cy.get("#application_is_first_time_homebuyer").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    // Check loan pre-approval checkbox
    cy.get("#application_has_loan_pre_approval").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    clickNext()

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Fill Name page with defaults
    fillNamePage()
    clickNext()

    // Fill Contact page with defaults (non-NRHP address, workInSf=yes)
    fillContactPage()
    clickNext()

    // Confirm address
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Indicate living alone
    indicateLivingAlone()

    // Should be on Income page
    cy.url().should("contain", "income")
  })
})
