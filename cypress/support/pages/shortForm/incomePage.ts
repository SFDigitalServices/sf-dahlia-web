// cypress/support/pages/shortForm/incomePage.ts

/**
 * Fill the income total and select the timeframe, then submit.
 */
export function fillIncomePage(income: string, timeframe: string = "per-year"): void {
  cy.get("#incomeTotal").clear().type(income)
  cy.get(`#incomeTimeframe_${timeframe}`).click()
}

/**
 * Indicate no vouchers/subsidies and submit.
 */
export function indicateNoVouchers(): void {
  cy.get("#householdVouchersSubsidies_no").click()
  cy.get("#submit").click()
}

/**
 * Indicate having vouchers/subsidies and submit.
 */
export function indicateHavingVouchers(): void {
  cy.get("#householdVouchersSubsidies_yes").click()
  cy.get("#submit").click()
}
