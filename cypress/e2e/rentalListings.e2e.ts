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

  it("does not redirect to sign in page when there is no user session", () => {
    cy.intercept("/api/v1/listings/a0W0P00000Hc7RcUAJ.json", {
      fixture: "openRentalListing.json",
    }).as("listingDetails")

    cy.get('[data-testid="listing-card-component"]')
      .first()
      .within(() => {
        cy.contains("a", "See Details").click()
        cy.wait("@listingDetails").its("response.statusCode").should("eq", 200)
      })
    cy.contains("a", "Apply Online").click()
    cy.contains("Let's get started")
    cy.contains("a", "Rent").click()
    cy.wait(5000)
    cy.url().should("not.contain", "/sign-in")
  })
})
