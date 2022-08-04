describe("Rental listings directory page", () => {
  beforeEach(() => {
    cy.visit("/listings/for-rent?react=true")
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
