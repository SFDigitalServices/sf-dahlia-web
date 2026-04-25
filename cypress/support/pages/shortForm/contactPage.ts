// cypress/support/pages/shortForm/contactPage.ts

export interface ContactPageData {
  phone?: string
  phoneType?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  workInSf?: "yes" | "no"
  includeAltPhone?: boolean
  altPhone?: string
  altPhoneType?: string
  includeMailingAddress?: boolean
  mailingAddress1?: string
  mailingCity?: string
  mailingState?: string
  mailingZip?: string
}

export const CONTACT_DEFAULTS: ContactPageData = {
  phone: "2222222222",
  phoneType: "home",
  address1: "4053 18th St.",
  city: "San Francisco",
  state: "California",
  zip: "94114",
  workInSf: "yes",
  altPhone: "5551111111",
  altPhoneType: "cell",
  mailingAddress1: "1651 Tiburon Blvd",
  mailingCity: "Tiburon",
  mailingState: "California",
  mailingZip: "94920",
}

/**
 * Fill the Contact page fields. Merges provided data with CONTACT_DEFAULTS.
 * Does NOT click submit — navigation is handled by navigationPage.
 */
export function fillContactPage(data: ContactPageData = {}): void {
  const merged = { ...CONTACT_DEFAULTS, ...data }

  cy.get('[ng-model="applicant.phone"]').clear().type(merged.phone!)
  cy.get('[ng-model="applicant.phoneType"]').select(merged.phoneType!)

  cy.get("#applicant_home_address_address1").clear().type(merged.address1!)
  if (merged.address2) {
    cy.get("#applicant_home_address_address2").clear().type(merged.address2)
  }
  cy.get("#applicant_home_address_city").clear().type(merged.city!)
  cy.get("#applicant_home_address_state").select(merged.state!)
  cy.get("#applicant_home_address_zip").clear().type(merged.zip!)

  if (merged.workInSf === "yes") {
    cy.get("#workInSf_yes").click()
  } else {
    cy.get("#workInSf_no").click()
  }

  if (merged.includeAltPhone) {
    cy.get('[ng-model="applicant.additionalPhone"]').click()
    cy.get('[ng-model="applicant.alternatePhone"]').clear().type(merged.altPhone!)
    cy.get('[ng-model="applicant.alternatePhoneType"]').select(merged.altPhoneType!)
  }

  if (merged.includeMailingAddress) {
    cy.get('[ng-model="applicant.hasAltMailingAddress"]').click()
    cy.get("#applicant_mailing_address_address1").clear().type(merged.mailingAddress1!)
    cy.get("#applicant_mailing_address_city").clear().type(merged.mailingCity!)
    cy.get("#applicant_mailing_address_state").select(merged.mailingState!)
    cy.get("#applicant_mailing_address_zip").clear().type(merged.mailingZip!)
  }
}

/**
 * Assert that Contact page fields have the expected values.
 * Note: phone displays as formatted '(222) 222-2222',
 * city may be uppercased, state shows as abbreviation (e.g. 'CA').
 */
export function expectContactPageValues(data: ContactPageData = {}): void {
  const merged = { ...CONTACT_DEFAULTS, ...data }

  if (merged.phone !== undefined) {
    // Phone is displayed formatted, e.g. '(222) 222-2222'
    cy.get('[ng-model="applicant.phone"]').should("have.value", formatPhone(merged.phone))
  }
  if (merged.address1 !== undefined) {
    cy.get("#applicant_home_address_address1").should("have.value", merged.address1)
  }
  if (merged.address2 !== undefined) {
    cy.get("#applicant_home_address_address2").should("have.value", merged.address2)
  } else {
    cy.get("#applicant_home_address_address2").should("have.value", "")
  }
  if (merged.city !== undefined) {
    // City may be uppercased after address validation
    cy.get("#applicant_home_address_city").should("have.value", merged.city.toUpperCase())
  }
  if (merged.state !== undefined) {
    // State shows as abbreviation (e.g. 'CA' for 'California')
    cy.get("#applicant_home_address_state").invoke("val").should("exist")
  }
  if (merged.zip !== undefined) {
    cy.get("#applicant_home_address_zip").invoke("val").should("exist")
  }

  if (merged.includeAltPhone) {
    cy.get('[ng-model="applicant.alternatePhone"]').should(
      "have.value",
      formatPhone(merged.altPhone!)
    )
  }

  if (merged.includeMailingAddress) {
    cy.get("#applicant_mailing_address_address1").should("have.value", merged.mailingAddress1)
    cy.get("#applicant_mailing_address_city").should("have.value", merged.mailingCity)
    cy.get("#applicant_mailing_address_state").invoke("val").should("exist")
    cy.get("#applicant_mailing_address_zip").should("have.value", merged.mailingZip)
  }
}

/**
 * Assert that all contact fields have empty values.
 */
export function expectContactFieldsEmpty(): void {
  cy.get("#applicant_phone").should("have.value", "")
  cy.get("#applicant_phone_type").should("have.value", "")
  cy.get("#applicant_home_address_address1").should("have.value", "")
  cy.get("#applicant_home_address_address2").should("have.value", "")
  cy.get("#applicant_home_address_city").should("have.value", "")
  cy.get("#applicant_home_address_state").should("have.value", "")
  cy.get("#applicant_home_address_zip").should("have.value", "")
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
