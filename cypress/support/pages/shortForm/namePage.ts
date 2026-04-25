// cypress/support/pages/shortForm/namePage.ts

export interface NamePageData {
  firstName?: string
  middleName?: string
  lastName?: string
  dobMonth?: string
  dobDay?: string
  dobYear?: string
  email?: string
}

export const NAME_DEFAULTS: Required<Omit<NamePageData, "email">> = {
  firstName: "Jane",
  middleName: "Valerie",
  lastName: "Doe",
  dobMonth: "2",
  dobDay: "22",
  dobYear: "1990",
}

/**
 * Fill the Name page fields. Merges provided data with NAME_DEFAULTS.
 * Does NOT click submit — navigation is handled by navigationPage.
 */
export function fillNamePage(data: NamePageData = {}): void {
  const merged = { ...NAME_DEFAULTS, ...data }

  cy.get('[ng-model="applicant.firstName"]').clear().type(merged.firstName)
  cy.get('[ng-model="applicant.middleName"]').clear().type(merged.middleName)
  cy.get('[ng-model="applicant.lastName"]').clear().type(merged.lastName)
  cy.get('[ng-model="applicant.dob_month"]').clear().type(merged.dobMonth)
  cy.get('[ng-model="applicant.dob_day"]').clear().type(merged.dobDay)
  cy.get('[ng-model="applicant.dob_year"]').clear().type(merged.dobYear)

  if (merged.email) {
    cy.get('[ng-model="applicant.email"]').clear().type(merged.email)
  }
}

/**
 * Assert that Name page fields have the expected values.
 */
export function expectNamePageValues(data: NamePageData): void {
  if (data.firstName !== undefined) {
    cy.get('[ng-model="applicant.firstName"]').should("have.value", data.firstName)
  }
  if (data.middleName !== undefined) {
    cy.get('[ng-model="applicant.middleName"]').should("have.value", data.middleName)
  }
  if (data.lastName !== undefined) {
    cy.get('[ng-model="applicant.lastName"]').should("have.value", data.lastName)
  }
  if (data.dobMonth !== undefined) {
    cy.get('[ng-model="applicant.dob_month"]').should("have.value", data.dobMonth)
  }
  if (data.dobDay !== undefined) {
    cy.get('[ng-model="applicant.dob_day"]').should("have.value", data.dobDay)
  }
  if (data.dobYear !== undefined) {
    cy.get('[ng-model="applicant.dob_year"]').should("have.value", data.dobYear)
  }
  if (data.email !== undefined) {
    cy.get('[ng-model="applicant.email"]').should("have.value", data.email)
  }
}

/**
 * Assert that name, DOB, and email fields are disabled (signed-in state),
 * and that the account settings link is present.
 */
export function expectNameFieldsDisabled(): void {
  cy.get('[ng-model="applicant.firstName"]').should("have.attr", "disabled")
  cy.get('[ng-model="applicant.middleName"]').should("have.attr", "disabled")
  cy.get('[ng-model="applicant.lastName"]').should("have.attr", "disabled")
  cy.get('[ng-model="applicant.dob_month"]').should("have.attr", "disabled")
  cy.get('[ng-model="applicant.dob_day"]').should("have.attr", "disabled")
  cy.get('[ng-model="applicant.dob_year"]').should("have.attr", "disabled")
  cy.get('[ng-model="applicant.email"]').should("have.attr", "disabled")
  cy.get('a[href="/account-settings"]').should("exist")
}
