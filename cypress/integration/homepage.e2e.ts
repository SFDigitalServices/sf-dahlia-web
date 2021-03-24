describe("Homepage integration tests", () => {
  it("Loads the homepage", () => {
    cy.visit("/")

    // Check that the homepage banner text is present on the page
    cy.contains("Apply for affordable housing")
  })
})
