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
    cy.get('input[name="email"]').clear().type("john.doe@example.com")
    cy.get('button[type="submit"]').click()
    cy.wait("@password").its("response.statusCode").should("eq", 200)
    cy.contains("We sent you an email").should("be.visible")
  })

  it("should show an error for non email address", () => {
    cy.visit("/forgot-password")
    cy.get('input[name="email"]').clear().type("test@")
    cy.get('button[type="submit"]').click()
    cy.contains("Email entered incorrectly").should("be.visible")
  })
})
