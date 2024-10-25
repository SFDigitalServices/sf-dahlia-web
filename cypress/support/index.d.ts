/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />
export {}

declare global {
  namespace Cypress {
    interface Chainable {
      findAndClickMenuItem(href: string): Chainable<any>

      signIn(email?: string): Chainable<any>

      addReactQueryParam(): Chainable<any>
    }
  }
  interface Window {
    ACCOUNT_INFORMATION_PAGES_REACT: boolean
  }
}
