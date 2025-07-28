import "@testing-library/cypress/add-commands"
import { userObjectGenerator } from "./util"

// Any commands added here must also have a type definition added to cypress/support/index.d.ts

Cypress.Commands.add("findAndClickMenuItem", (href: string) => {
  cy.findByRole("navigation", { name: "main navigation" }).find(`a[href*="${href}"]`).click()
})

Cypress.Commands.add("signIn", (email: string = "test@test.com") => {
  cy.intercept("/api/v1/auth/sign_in", userObjectGenerator({ email }))
  cy.intercept("/api/v1/auth/validate_token", userObjectGenerator({ email }))

  cy.visit("/sign-in?react=true")
  cy.contains("Sign in")
  cy.get("input[name=email]").type("test@test.com")
  cy.get("input[name=password]").type("password123")
  cy.get("button[type=submit]").click()
})

Cypress.Commands.add("addReactQueryParam", () => {
  cy.url().then((url) => {
    // eslint-disable-next-line unicorn/prefer-includes
    const newUrl = url.indexOf("?") !== -1 ? `${url}&react=true` : `${url}?react=true`
    cy.visit(newUrl)
  })
})

Cypress.Commands.addQuery("isInViewport", () => {
  return (subject) => {
    const { top, left } = subject[0].getBoundingClientRect()
    expect(top).to.be.at.least(0)
    expect(left).to.be.at.least(0)
  }
})
