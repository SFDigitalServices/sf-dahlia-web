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
 * Create an account via the React create-account UI form.
 * Navigates to /create-account, fills the form, submits, and confirms via API.
 */
export function createAccountViaUI(account: TestAccount): void {
  const [dobMonth, dobDay, dobYear] = account.birthDate.split("/")
  cy.visit("/create-account")
  cy.get('input[name="firstName"]').clear().type(account.firstName)
  cy.get('input[name="lastName"]').clear().type(account.lastName)
  cy.get('input[name="dobObject.birthMonth"]').clear().type(dobMonth)
  cy.get('input[name="dobObject.birthDay"]').clear().type(dobDay)
  cy.get('input[name="dobObject.birthYear"]').clear().type(dobYear)
  cy.get('input[name="email"]').clear().type(account.email)
  cy.get('input[name="password"]').clear().type(account.password)
  cy.get('button[type="submit"]').click()
  confirmAccount(account.email)
}
