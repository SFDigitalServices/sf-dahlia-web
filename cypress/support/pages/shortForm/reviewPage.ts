// cypress/support/pages/shortForm/reviewPage.ts

/**
 * For each key/value pair, find the element by ID and assert its text contains the value
 * (case-insensitive).
 */
export function expectReviewPageContains(fields: Record<string, string>): void {
  for (const [id, expectedText] of Object.entries(fields)) {
    cy.get(`#${id}`)
      .invoke("text")
      .then((text) => {
        expect(text.toLowerCase()).to.contain(expectedText.toLowerCase())
      })
  }
}

/**
 * Click submit to confirm review details.
 */
export function confirmReviewDetails(): void {
  cy.get("#submit").click()
}

/**
 * Agree to terms and submit the application.
 */
export function agreeToTermsAndSubmit(): void {
  cy.get("#terms_yes").click()
  cy.get("#submit").click()
}

/**
 * Click the "View submitted application" button.
 */
export function clickViewSubmittedApplication(): void {
  cy.get("#view-app").click()
}
