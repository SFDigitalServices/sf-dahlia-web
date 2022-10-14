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

describe("Listing Details for Open Listings", () => {
  const testListings = {
    OPEN_RENTAL: {
      id: "a0W0P00000F8YG4UAN",
      title: "TEST Automated Listing (do not modify)",
    },
    OPEN_SALE: {
      id: "a0W0P00000GlKfBUAV",
      address: "1 South Van Ness Ave, San Francisco, CA 94103",
      title: "TEST Sale Listing (do not modify) - Homeownership Acres",
    },
  }

  beforeEach(() => {
    /* Using iphone-x size https://docs.cypress.io/api/commands/viewport#Usage */
    cy.viewport(375, 812)
  })
  afterEach(() => {
    // TODO: remove me. we shouldn't have to wait in between tests, but there is a rogue
    // loading issue beyond the scope of this story
    cy.wait(3000)
  })

  describe("Rental Listing", () => {
    it("displays in English", () => {
      verifyListing(
        null,
        testListings.OPEN_RENTAL.id,
        "A picture of the building",
        testListings.OPEN_RENTAL.title,
        null,
        "Apply Online"
      )
    })

    it("displays in Spanish", () => {
      verifyListing(
        "es",
        testListings.OPEN_RENTAL.id,
        "Una foto del edificio",
        testListings.OPEN_RENTAL.title,
        null,
        "Presente su solicitud en línea"
      )
    })

    it("displays in Chinese", () => {
      verifyListing(
        "zh",
        testListings.OPEN_RENTAL.id,
        "建築物照片",
        testListings.OPEN_RENTAL.title,
        "",
        "網上申請"
      )
    })

    it("displays in Filipino", () => {
      verifyListing(
        "tl",
        testListings.OPEN_RENTAL.id,
        "Isang larawan ng gusali",
        testListings.OPEN_RENTAL.title,
        null,
        "Mag-aplay Online"
      )
    })
  })
})
