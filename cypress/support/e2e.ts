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
Cypress.on("uncaught:exception", (err, runnable) => {
  // Google Translate injects scripts that throw __closure_events_fn_* errors
  // when navigating between pages — these are not our bugs.
  if (err.message.includes("__closure_events_fn_")) {
    return false
  }
  // Let all other uncaught exceptions fail the test as normal
  return true
})
