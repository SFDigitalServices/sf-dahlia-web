// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import "@testing-library/cypress/add-commands"

// Any commands added here must also have a type definition added to cypress/support/index.d.ts

Cypress.Commands.add("findAndClickMenuItem", (href: string) => {
  cy.findByRole("navigation", { name: "main navigation" }).find(`a[href*="${href}"]`).click()
})
