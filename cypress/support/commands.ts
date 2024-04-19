import "@testing-library/cypress/add-commands"

// Any commands added here must also have a type definition added to cypress/support/index.d.ts

Cypress.Commands.add("findAndClickMenuItem", (href: string) => {
  cy.findByRole("navigation", { name: "main navigation" }).find(`a[href*="${href}"]`).click()
})
