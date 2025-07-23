describe("Rental listings directory page", () => {
  beforeEach(() => {
    cy.intercept("api/v1/listings.json**", { fixture: "listings.json" }).as("listings")
    cy.visit("/listings/for-rent?react=true")
    cy.wait("@listings")
  })

  it("renders a listing with the correct interactivity", () => {
    cy.intercept("/api/v1/listings/a0W0P00000Hc7RcUAJ.json", {
      fixture: "openRentalListing.json",
    }).as("listingDetails")

    cy.get('[data-testid="listing-card-component"]')
      .first()
      .within(() => {
        cy.get("table").click()
        cy.url().should("include", "/listings/for-rent?react=true")
        cy.get("@listingDetails.all").should("have.length", 0)
        cy.contains("a", "See Details").click()
        cy.wait("@listingDetails").its("response.statusCode").should("eq", 200)
      })
    cy.url().should("include", "/listings/a0W0P00000Hc7RcUAJ")
    cy.go("back")

    cy.get('[data-testid="listing-card-component"]')
      .first()
      .within(() => {
        cy.get("h2").click()
        cy.wait("@listingDetails").its("response.statusCode").should("eq", 200)
      })
    cy.url().should("include", "/listings/a0W0P00000Hc7RcUAJ")
  })

  it("renders upcoming and results", () => {
    cy.contains("Upcoming Lotteries")
    cy.contains("Lottery Results")
  })

  it("opens Lottery Results", () => {
    cy.get(".listings-group__button button").first().click()
    cy.contains("Hide Upcoming Lotteries")
    cy.get(".listings-group__button button").first().click()
    cy.contains("Show Upcoming Lotteries")
  })

  it("redirects to the correct section", () => {
    cy.viewport(640, 960)
    cy.visit("/listings/for-rent#upcoming-lotteries")
    cy.wait("@listings")
    cy.get("#upcoming-lotteries").isInViewport()
  })
})
