import { userObjectGenerator } from "../support/util"

describe("Reset Password Page", () => {
  it("should submit request to change the password", () => {
    cy.intercept(
      "GET",
      "/api/v1/auth/validate_token",
      userObjectGenerator({ email: "chefcurry@gsw.com" })
    ).as("validate_token")

    cy.intercept("PUT", "/api/v1/auth/password", {
      statusCode: 200,
    }).as("password")

    cy.intercept("/api/v1/account/my-applications", { applications: [] })

    // need an expiry date which hasn't expired
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    cy.visit(
      "/reset-password?access-token=11111&client=11111&expiry=" +
        tomorrow.getTime() +
        "&reset_password=true&uid=chefcurry%40gsw.com"
    )
    cy.wait("@validate_token")
    cy.get('input[name="password"]').clear().type("test1ng!")
    cy.get('button[type="submit"]').click()
    cy.wait("@password")
    cy.url().should("include", "/my-applications")
  })

  it("should redirect to sign-in for invalid token", () => {
    cy.intercept("GET", "/api/v1/auth/validate_token", {
      statusCode: 401,
    }).as("validate_token")

    cy.visit(
      "/reset-password?access-token=11111&client=11111&expiry=" +
        Date.now() +
        "&reset_password=true&uid=chefcurry%40gsw.com"
    )
    cy.wait("@validate_token")

    cy.url().should("include", "/sign-in")
  })

  it("should enforce password standards", () => {
    cy.intercept(
      "GET",
      "/api/v1/auth/validate_token",
      userObjectGenerator({ email: "luka@lal.com" })
    ).as("validate_token")

    // need an expiry date which hasn't expired
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    cy.visit(
      "/reset-password?access-token=11111&client=11111&expiry=" +
        tomorrow.getTime() +
        "&reset_password=true&uid=luka%40lal.com"
    )
    cy.wait("@validate_token")
    cy.get('input[name="password"]').clear().type("test")
    cy.get('button[type="submit"]').click()
    cy.contains(
      "Choose a strong password with at least 8 characters, 1 letter, and 1 number"
    ).should("be.visible")
  })
})
