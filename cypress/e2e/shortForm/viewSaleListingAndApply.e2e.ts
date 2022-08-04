/**
 * As a San Franciscan looking for affordable housing
 * I should be able to view a sale listing and fill out a short form application
 * In order to enter the lottery for the listing
 */
describe("Short Form Application - Sale Listing", () => {
  it("goes to the listing page", () => {
    cy.visit("/listings/a0W0P00000GlKfBUAV")
    cy.contains("TEST Sale Listing (do not modify) - Homeownership Acres")
    cy.contains("1 South Van Ness Ave, San Francisco CA, 94103")
  })

  it("goes to the welcome page of the 'Test Sale Listing' application", () => {
    cy.findByRole("button", { name: "Apply Online" }).click()
    cy.contains("Let's get started on your application")
  })

  it("starts the application in English", () => {
    cy.findByRole("button", { name: "Begin" }).click()
    cy.contains("Here's what to expect for this application.")
  })

  it("goes to the prerequisites page of the application", () => {
    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("First, let’s make sure you’re eligible to apply.")
  })

  it("displays error for an incomplete prerequisites form", () => {
    cy.findByText("I have attended 10 hours of Homebuyer Education in the past year.").click()
    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("This field is required")
  })

  it("goes to the Name page of the application", () => {
    cy.findByText("I have not owned residential property within the past 3 years.").click()

    // We expect lending institutions and agents to be updated frequently, so we just select the first available option.
    cy.findByLabelText("Homebuyer education agency").closest("select").select(1)
  })
})
