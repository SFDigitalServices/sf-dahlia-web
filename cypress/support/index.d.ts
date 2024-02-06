/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />
export {}

declare global {
  namespace Cypress {
    interface Chainable {
      findAndClickMenuItem(href: string): Chainable<any>
    }
  }
}
