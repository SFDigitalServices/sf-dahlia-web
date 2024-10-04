describe("Sign In integration tests", () => {
  beforeEach(() => {
    cy.visit("/sign-in")
  })

  it("renders in English", () => {
    cy.contains("Sign in")
    cy.contains("Create an account")
    cy.contains("Fill in applications faster")
  })
})
