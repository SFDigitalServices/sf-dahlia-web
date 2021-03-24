describe("Navigating around the site", () => {
  it("Loads the homepage directly", () => {
    cy.visit("/")

    // Check that the homepage banner text is present on the page
    cy.contains("Apply for affordable housing")
  })
})
