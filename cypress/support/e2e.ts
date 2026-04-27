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
    /https?:\/\/translate\.googleapis\.com[/\s]/.test(err.stack ?? "") ||
    err.stack?.includes("translate_http") ||
    err.message.includes("__closure_events_fn_")
  ) {
    return false
  }
  return true
})

// Address validation intercept:
// - Locally (STUB_ADDRESS_VALIDATION=true in .env): return a canned success response so
//   tests don't need real SmartyStreets/EasyPost credentials.
// - CI: hit the real service but fail fast with a clear message on 5xx.
beforeEach(() => {
  if (Cypress.env("stubAddressValidation")) {
    cy.intercept("POST", "/api/v1/addresses/validate.json", {
      statusCode: 200,
      body: {
        address: {
          street1: "1222 HARRISON ST",
          street2: "# 100",
          city: "SAN FRANCISCO",
          state: "CA",
          zip: "94103",
        },
        error: null,
      },
    }).as("validateAddress")
    // Also stub the GIS boundary check so preferenceAddressMatch is set to 'Matched',
    // which makes the app correctly show the NRHP preference page instead of Live/Work.
    cy.intercept("POST", "/api/v1/addresses/gis-data.json", {
      statusCode: 200,
      body: {
        gis_data: {
          address: "1222 HARRISON ST, San Francisco, California, 94103",
          score: 100,
          boundary_match: true,
        },
      },
    }).as("gisData")
  } else {
    cy.intercept("POST", "/api/v1/addresses/validate.json", (req) => {
      req.continue((res) => {
        if (res.statusCode >= 500) {
          expect(
            res.statusCode,
            `Address validation API returned ${res.statusCode} — ` +
              `SmartyStreets may not be configured. Check your .env SMARTY_STREETS_* keys.`
          ).to.be.lessThan(500)
        }
      })
    })
  }
})
