import Chance from "chance"

const chance = new Chance()
const PASSWORD_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export interface TestAccount {
  fullName: string
  firstName: string
  lastName: string
  email: string
  birthDate: string
  password: string
}

export const LISTING_IDS = {
  test: "a0W0P00000F8YG4UAN",
  senior: "a0W0P00000GwGl3",
  sale: "a0W0P00000GlKfBUAV",
  customEducator1: "a0W4U00000NlQ30UAF",
  customEducator2: "a0W4U00000NlQ2wUAF",
} as const

export function createTestAccount(name: string, birthDate = "1/1/1902"): TestAccount {
  const [first, ...rest] = name.split(" ")
  const lastName = rest.join(" ") || first

  return {
    fullName: `E2ETEST-${name}`,
    firstName: `E2ETEST-${first}`,
    lastName,
    email: chance.email(),
    birthDate,
    password: chance.string({ length: 15, pool: PASSWORD_CHARS }) + "tS9",
  }
}

export function confirmAccount(email: string) {
  return cy.request(`/api/v1/account/confirm/?email=${encodeURIComponent(email)}`)
}

/**
 * Create an account via the AngularJS create-account UI form.
 * Navigates to /create-account, fills the form, submits, and confirms via API.
 */
export function createAccountViaUI(account: TestAccount): void {
  const [dobMonth, dobDay, dobYear] = account.birthDate.split("/")
  cy.visit("/create-account")
  cy.get('[ng-model="userAuth.contact.firstName"]').clear().type(account.firstName)
  cy.get('[ng-model="userAuth.contact.lastName"]').clear().type(account.lastName)
  cy.get('[ng-model="userAuth.contact.dob_month"]').clear().type(dobMonth)
  cy.get('[ng-model="userAuth.contact.dob_day"]').clear().type(dobDay)
  cy.get('[ng-model="userAuth.contact.dob_year"]').clear().type(dobYear)
  cy.get('[ng-model="userAuth.user.email"]').clear().type(account.email)
  cy.get('[ng-model="userAuth.user.email_confirmation"]').clear().type(account.email)
  cy.get('[ng-model="userAuth.user.password"]').clear().type(account.password)
  cy.get('[ng-model="userAuth.user.password_confirmation"]').clear().type(account.password)
  cy.get("#submit").click()
  confirmAccount(account.email)
}
