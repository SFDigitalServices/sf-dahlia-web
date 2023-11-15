/**
 * Util function to verify a listing details page
 * @param {string} language - optional language code
 * @param {string } id - listing id
 * @param {string} altPhotoText - alternative text that displays for listing image
 * @param {string} title - title of the listing
 * @param {string} address -(unfortunately) optional address for the listing
 * @param {string} applyButtonText - text for the apply button
 */
function verifyListing(language, id, altPhotoText, title, address, applyButtonText) {
  const langPart = language ? `/${language}` : ""
  cy.visit(`${langPart}/listings/${id}?react=true`)

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

describe("Listing Details for Open Listings", () => {
  afterEach(() => {
    // TODO: remove me once this is fixed. we shouldn't have to wait in between tests, but
    // there is a rogue loading issue beyond the scope of this story
    cy.wait(3000)
  })

  describe("Rental Listing " + testListings.OPEN_RENTAL.id, () => {
    it("displays in English", () => {
      verifyListing(
        null,
        testListings.OPEN_RENTAL.id,
        testListings.OPEN_RENTAL.alt,
        testListings.OPEN_RENTAL.title,
        null,
        APPLY_BUTTON_TEXT.en
      )
    })

    it("displays in Spanish", () => {
      const langPart = "en"
      cy.visit(`${langPart}/listings/${testListings.OPEN_RENTAL.id}?react=true`)

      cy.get(".image-card__inner > img")
        .should("be.visible")
        .should("have.attr", "alt")
        .should("not.be", testListings.OPEN_RENTAL.alt)
    })

    it("displays in Chinese", () => {
      const langPart = "zh"
      cy.visit(`${langPart}/listings/${testListings.OPEN_RENTAL.id}?react=true`)

      cy.get(".image-card__inner > img")
        .should("be.visible")
        .should("have.attr", "alt")
        .should("not.be", testListings.OPEN_RENTAL.alt)
    })

    it("displays in Filipino", () => {
      const langPart = "tl"
      cy.visit(`${langPart}/listings/${testListings.OPEN_RENTAL.id}?react=true`)

      cy.get(".image-card__inner > img")
        .should("be.visible")
        .should("have.attr", "alt")
        .should("not.be", testListings.OPEN_RENTAL.alt)
    })
  })

  describe("Sale Listing " + testListings.OPEN_SALE.id, () => {
    it("displays in English", () => {
      verifyListing(
        null,
        testListings.OPEN_SALE.id,
        testListings.OPEN_SALE.alt,
        testListings.OPEN_SALE.title,
        testListings.OPEN_SALE.address,
        APPLY_BUTTON_TEXT.en
      )
    })

    it("displays in Spanish", () => {
      const langPart = "en"
      cy.visit(`${langPart}/listings/${testListings.OPEN_SALE.id}?react=true`)

      cy.get(".image-card__inner > img")
        .should("be.visible")
        .should("have.attr", "alt")
        .should("not.be", testListings.OPEN_SALE.alt)
    })

    it("displays in Chinese", () => {
      const langPart = "zh"
      cy.visit(`${langPart}/listings/${testListings.OPEN_SALE.id}?react=true`)

      cy.get(".image-card__inner > img")
        .should("be.visible")
        .should("have.attr", "alt")
        .should("not.be", testListings.OPEN_SALE.alt)
    })

    it("displays in Filipino", () => {
      const langPart = "tl"
      cy.visit(`${langPart}/listings/${testListings.OPEN_SALE.id}?react=true`)

      cy.get(".image-card__inner > img")
        .should("be.visible")
        .should("have.attr", "alt")
        .should("not.be", testListings.OPEN_SALE.alt)
    })
  })
})
