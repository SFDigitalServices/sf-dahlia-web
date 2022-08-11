describe("Short Form Application - Sale Listing", () => {
  beforeEach(() => {
    /* Using iphone-x size https://docs.cypress.io/api/commands/viewport#Usage */
    cy.viewport(375, 812)
  })

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

  it("goes to the Name page of the application", () => {
    cy.findByText("I have not owned residential property within the past 3 years.").click()

    cy.findByText("I have attended 10 hours of Homebuyer Education in the past year.").click()

    // We expect lending institutions and agents to be updated frequently, so we just select the first available option.
    cy.findByLabelText("Homebuyer education agency").closest("select").select(1)

    cy.findByText(
      "I am pre-approved for a mortgage loan by a MOHCD-Approved Loan" + " Officer."
    ).click()
    cy.findByLabelText("lending institution").closest("select").select(1)
    cy.findByLabelText("Loan officer").closest("select").select(1)

    cy.findByRole("button", { name: "Upload verification letter" }).click()
    cy.get(
      'input[id="ngf-Homebuyer education certificateFile"]'
    ).selectFile("cypress/fixtures/logo-city.png", { force: true })
  })
})
