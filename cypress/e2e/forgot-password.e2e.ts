describe("Forgot Password Page", () => {
  it("should request password reset successfully", () => {
    cy.intercept("POST", "/api/v1/auth/password", {
      statusCode: 200,
      body: {
        success: true,
        message:
          "An email has been sent to 'john.doe@example.com' containing instructions for resetting your password.",
      },
    }).as("password")

    cy.visit("/forgot-password")
    cy.get('input[name="email"]').clear()
    cy.get('input[name="email"]').type("john.doe@example.com")
    cy.get('input[name="email"]').should("have.value", "john.doe@example.com")
    cy.contains('[type="submit"]', "Send email").click()
    cy.wait("@password").its("response.statusCode").should("eq", 200)
    cy.contains("an email with a link to reset your password").should("be.visible")
  })

  it("should show an error for non email address", () => {
    cy.visit("/forgot-password")
    cy.get('input[name="email"]').clear()
    cy.get('input[name="email"]').type("test@")
    cy.contains('[type="submit"]', "Send email").click()
    cy.get('input[aria-invalid="true"]').should("exist")
  })
})
