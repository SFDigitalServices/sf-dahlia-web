// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
// Import commands.js using ES2015 syntax:
import "./commands"

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Suppress uncaught exceptions from third-party scripts (e.g. Google Translate)
// so they don't fail our tests. Errors originating from our own app code will
// still surface via normal assertion failures.
Cypress.on("uncaught:exception", (err) => {
  // Suppress any error thrown by Google Translate scripts
  if (
    err.stack?.includes("translate.googleapis.com") ||
    err.stack?.includes("translate_http") ||
    err.message.includes("__closure_events_fn_")
  ) {
    return false
  }
  return true
})

// Intercept address validation globally and fail fast with a clear message
// if the external SmartyStreets service returns a 5xx (e.g. not configured locally).
// This prevents tests from timing out with a cryptic "element not found" error.
beforeEach(() => {
  cy.intercept("POST", "/api/v1/addresses/validate.json", (req) => {
    req.continue((res) => {
      if (res.statusCode >= 500) {
        // expect() propagates correctly from intercept response handlers and
        // fails the test immediately with a readable message.
        expect(
          res.statusCode,
          `Address validation API returned ${res.statusCode} — ` +
            `SmartyStreets may not be configured. Check your .env SMARTY_STREETS_* keys.`
        ).to.be.lessThan(500)
      }
    })
  })
})
