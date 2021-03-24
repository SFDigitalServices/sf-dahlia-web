describe("Homepage integration tests", () => {
  it("loads the homepage", () => {
    cy.visit("/")

    // Check that the homepage banner text is present on the page
    cy.contains("Apply for affordable housing")
  })
})
