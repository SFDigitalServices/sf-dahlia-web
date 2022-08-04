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

// eslint-disable-next-line no-undef
Cypress.on("uncaught:exception", (err) => {
  // TODO: remove this once we rewrite the application forms with DAH-732
  // ignore translate function in angular causing errors
  if (err.message.includes(" Maximum call stack size exceeded")) {
    return false
  }
})
