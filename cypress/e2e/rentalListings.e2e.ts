import { RouteHandler } from "cypress/types/net-stubbing"

let listingsFixture: RouteHandler

describe("Rental listings directory page", () => {
  beforeEach(() => {
    cy.fixture("listings.json")
      .as("listingsFixture")
      .then((listings) => {
        listingsFixture = listings
      })

    cy.intercept("GET", `listings.json**`, listingsFixture).as("listings")

    cy.visit("/listings/for-rent?react=true")
    cy.wait("@listings")
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
})
