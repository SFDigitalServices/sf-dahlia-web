/**
 * Util function to verify a listing details page
 * @param {string } id - listing id
 * @param {string} altPhotoText - alternative text that displays for listing image
 * @param {string} title - title of the listing
 * @param {string} address -(unfortunately) optional address for the listing
 * @param {string} applyButtonText - text for the apply button
 * @param {string} language - optional language code
 */
function verifyRentalListing(
  id: string,
  altPhotoText: string,
  title: string,
  address: string,
  applyButtonText: string,
  language?: string
) {
  const langPart = language ? `/${language}` : ""
  if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
    cy.intercept(`${id}.json`, { fixture: "openRentalListing.json" }).as("openRentalListing")
  }

  cy.visit(`${langPart}/listings/${id}?react=true`)
  if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
    cy.wait("@openRentalListing")
    cy.wait("@units")
    cy.wait("@ami")
    cy.wait("@preferences")
  }

  // verify image exists
  cy.get(`[alt="${altPhotoText}"]`).should("be.visible")

  // verify listing title
  cy.contains(title)

  // unfortunately not all test listings have an address. verify if provided
  if (address) {
    cy.contains(address)
  }

  // verify the apply link is visible
  cy.contains(applyButtonText)
}

function verifySaleListing(
  id: string,
  altPhotoText: string,
  title: string,
  address: string,
  applyButtonText: string,
  language?: string
) {
  const langPart = language ? `/${language}` : ""
  if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
    cy.intercept(`${id}.json`, { fixture: "openSaleListing.json" }).as("openSaleListing")
  }

  cy.visit(`${langPart}/listings/${id}?react=true`)
  if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
    cy.wait("@openSaleListing")
    cy.wait("@units")
    cy.wait("@ami")
  }

  // verify image exists
  cy.get(`[alt="${altPhotoText}"]`).should("be.visible")

  // verify listing title
  cy.contains(title)

  // unfortunately not all test listings have an address. verify if provided
  if (address) {
    cy.contains(address)
  }

  // verify the apply link is visible
  cy.contains(applyButtonText)
}

const testListings = {
  OPEN_RENTAL: {
    id: "a0W0P00000F8YG4UAN",
    title: "TEST Automated Listing (do not modify)",
    alt: "Listing Name:TEST Automated Listing (do not modify), Address:San Francisco CA,",
  },
  OPEN_SALE: {
    id: "a0W0P00000GlKfBUAV",
    address: "1 South Van Ness Ave, San Francisco, CA 94103",
    title: "TEST Sale Listing (do not modify) - Homeownership Acres",
    alt: "Listing Name:TEST Sale Listing (do not modify) - Homeownership Acres, Address:1 South Van Ness Ave, San Francisco CA, 94103",
  },
}

const APPLY_BUTTON_TEXT = {
  en: "Apply Online",
}

const NON_ENGLISH_LANGUAGES = ["Spanish", "Chinese", "Tagalog"]

enum LanguagePrefix {
  Spanish = "es",
  Chinese = "zh",
  Tagalog = "tl",
}

describe("Listing Details for Open Listings", () => {
  beforeEach(() => {
    if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
      cy.intercept("ami.json**", { fixture: "ami.json" }).as("ami")
      cy.intercept("units", { fixture: "units.json" }).as("units")
      cy.intercept("preferences", { fixture: "preferences.json" }).as("preferences")
    }
  })

  describe("Rental Listing " + testListings.OPEN_RENTAL.id, () => {
    it("displays in English", () => {
      verifyRentalListing(
        testListings.OPEN_RENTAL.id,
        testListings.OPEN_RENTAL.alt,
        testListings.OPEN_RENTAL.title,
        null,
        APPLY_BUTTON_TEXT.en,
        null
      )
    })

    NON_ENGLISH_LANGUAGES.forEach((language) => {
      it(`displays in ${language}`, () => {
        const langPart = LanguagePrefix[language]

        if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
          cy.intercept(`${testListings.OPEN_RENTAL.id}.json`, {
            fixture: "openRentalListing.json",
          }).as("openRentalListing")
        }
        cy.visit(`${langPart}/listings/${testListings.OPEN_RENTAL.id}?react=true`)
        if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
          cy.wait("@openRentalListing")
          cy.wait("@units")
          cy.wait("@ami")
          cy.wait("@preferences")
        }
        cy.get(".image-card__inner > img")
          .should("be.visible")
          .should("have.attr", "alt")
          .should("not.be", testListings.OPEN_RENTAL.alt)
      })
    })
  })

  describe("Sale Listing " + testListings.OPEN_SALE.id, () => {
    it("displays in English", () => {
      verifySaleListing(
        testListings.OPEN_SALE.id,
        testListings.OPEN_SALE.alt,
        testListings.OPEN_SALE.title,
        testListings.OPEN_SALE.address,
        APPLY_BUTTON_TEXT.en,
        null
      )
    })

    NON_ENGLISH_LANGUAGES.forEach((language) => {
      it(`displays in ${language}`, () => {
        const langPart = LanguagePrefix[language]
        if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
          cy.intercept(`${testListings.OPEN_SALE.id}.json`, { fixture: "openSaleListing.json" }).as(
            "openSaleListing"
          )
        }

        cy.visit(`${langPart}/listings/${testListings.OPEN_SALE.id}?react=true`)
        if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
          cy.wait("@openSaleListing")
          cy.wait("@units")
          cy.wait("@ami")
        }
        cy.get(".image-card__inner > img")
          .should("be.visible")
          .should("have.attr", "alt")
          .should("not.be", testListings.OPEN_SALE.alt)
      })
    })
  })
})
