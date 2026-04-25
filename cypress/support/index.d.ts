/* eslint-disable @typescript-eslint/no-explicit-any */
// <reference types="cypress" />
export {}

declare global {
  namespace Cypress {
    interface Chainable {
      findAndClickMenuItem(href: string): Chainable<any>

      signIn(email?: string): Chainable<any>

      addReactQueryParam(): Chainable<any>

      isInViewport(): Chainable<any>

      uploadFile(inputSelector: string, filePath: string): Chainable<void>
      signInOnWelcomeBack(email: string, password: string): Chainable<void>
      createAccountFromConfirmation(data: {
        email: string
        password: string
        fullName: string
        birthDate: string
      }): Chainable<void>
      goToApplication(listingType: string): Chainable<void>
      confirmAccountByEmail(email: string): Chainable<void>
    }
  }
  interface Window {
    ACCOUNT_INFORMATION_PAGES_REACT: boolean
  }
}
