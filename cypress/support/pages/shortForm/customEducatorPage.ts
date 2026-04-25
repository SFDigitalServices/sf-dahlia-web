// cypress/support/pages/shortForm/customEducatorPage.ts

export const VALID_JOB_CODE = "0110"

/**
 * Answer the SFUSD screening question (yes or no).
 */
export function fillScreeningQuestion(answer: "yes" | "no"): void {
  cy.get(`#customEducatorScreeningAnswer_${answer}`).click()
}

/**
 * Fill the Job Classification Number field.
 */
export function fillJobClassificationNumber(code: string): void {
  cy.get('[ng-model="application.customEducatorJobClassificationNumber"]').clear().type(code)
}
