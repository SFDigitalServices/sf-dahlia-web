// cypress/support/pages/shortForm/navigationPage.ts

/**
 * Click the Next/Submit button.
 */
export function clickNext(): void {
  cy.get("#submit").click()
}

/**
 * Click the Next/Submit button n times in sequence.
 */
export function clickNextTimes(n: number): void {
  for (let i = 0; i < n; i++) {
    cy.get("#submit").click()
  }
}

/**
 * Click the Save and Finish Later button.
 */
export function clickSaveAndFinishLater(): void {
  cy.get("#save_and_finish_later").click()
}

/**
 * Confirm a modal by clicking the "Leave" button.
 */
export function confirmModal(): void {
  cy.contains("button", "Leave").click()
}

/**
 * Cancel a modal by clicking the "Stay" button.
 */
export function cancelModal(): void {
  cy.contains("button", "Stay").click()
}

/**
 * Close a modal by clicking the close (X) link.
 */
export function closeModal(): void {
  cy.get('a[aria-label="Close"]').click()
}

/**
 * Continue without signing in by clicking the confirm button.
 */
export function continueWithoutSigningIn(): void {
  cy.get("#confirm_no_account").click()
}

/**
 * Navigate to a specific section using the progress nav sidebar.
 */
export function navigateToSection(section: string): void {
  cy.get(".progress-nav").contains("a", section.toUpperCase()).first().click()
}
