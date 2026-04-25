// cypress/support/pages/shortForm/alternateContactPage.ts

export interface AlternateContactData {
  typeOther?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

export const ALTERNATE_CONTACT_DEFAULTS: AlternateContactData = {
  typeOther: "Psychiatrist",
  firstName: "Sigmund",
  lastName: "Freud",
  email: "siggy@psych.com",
  phone: "1231231234",
  address: "100 Van Ness Ave",
  city: "San Francisco",
  state: "California",
  zip: "94110",
}

/**
 * Click the "Other" alternate contact type radio and type the other value.
 */
export function fillAlternateContactType(data: AlternateContactData = {}): void {
  const merged = { ...ALTERNATE_CONTACT_DEFAULTS, ...data }
  cy.get("#alternateContactType_other").click()
  cy.get('[ng-model="alternateContact.alternateContactTypeOther"]').clear().type(merged.typeOther!)
}

/**
 * Fill the alternate contact name fields.
 */
export function fillAlternateContactName(data: AlternateContactData = {}): void {
  const merged = { ...ALTERNATE_CONTACT_DEFAULTS, ...data }
  cy.get('[ng-model="alternateContact.firstName"]').clear().type(merged.firstName!)
  cy.get('[ng-model="alternateContact.lastName"]').clear().type(merged.lastName!)
}

/**
 * Fill the alternate contact phone, email, and address fields.
 */
export function fillAlternateContactContact(data: AlternateContactData = {}): void {
  const merged = { ...ALTERNATE_CONTACT_DEFAULTS, ...data }
  cy.get('[ng-model="alternateContact.phone"]').type(merged.phone!)
  cy.get('[ng-model="alternateContact.email"]').clear().type(merged.email!)
  cy.get("#alternateContact_mailing_address_address1").clear().type(merged.address!)
  cy.get("#alternateContact_mailing_address_city").clear().type(merged.city!)
  cy.get("#alternateContact_mailing_address_state").select(merged.state!)
  cy.get("#alternateContact_mailing_address_zip").clear().type(merged.zip!)
}

/**
 * Fill all alternate contact sections in sequence: type, name, then contact info.
 */
export function fillAlternateContactAllSections(data: AlternateContactData = {}): void {
  fillAlternateContactType(data)
  fillAlternateContactName(data)
  fillAlternateContactContact(data)
}

/**
 * Assert that all alternate contact fields match the defaults.
 */
export function expectAlternateContactValues(data: AlternateContactData = {}): void {
  const merged = { ...ALTERNATE_CONTACT_DEFAULTS, ...data }
  cy.get('[ng-model="alternateContact.alternateContactTypeOther"]').should(
    "have.value",
    merged.typeOther
  )
  cy.get('[ng-model="alternateContact.firstName"]').should("have.value", merged.firstName)
  cy.get('[ng-model="alternateContact.lastName"]').should("have.value", merged.lastName)
  cy.get('[ng-model="alternateContact.phone"]').should(
    "have.value",
    formatPhone(merged.phone!)
  )
  cy.get('[ng-model="alternateContact.email"]').should("have.value", merged.email)
  cy.get("#alternateContact_mailing_address_address1").should("have.value", merged.address)
  cy.get("#alternateContact_mailing_address_city").should("have.value", merged.city)
  cy.get("#alternateContact_mailing_address_zip").should("have.value", merged.zip)
}

/**
 * Format a 10-digit phone string as (XXX) XXX-XXXX.
 */
function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
  }
  return phone
}
