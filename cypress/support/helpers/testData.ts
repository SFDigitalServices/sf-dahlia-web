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

export function confirmAccount(email: string): void {
  cy.request(`/api/v1/account/confirm/?email=${email}`)
}
