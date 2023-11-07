describe("Additional Housing Opportunities", () => {
  describe("When a user views additional housing page", () => {
    it(`shows 2 item card grids`, () => {
      cy.visit(`additional-resources?react=true`)
      cy.get(".info-card-grid-additional-resources").should("have.length", 2)
    })
    it(`displays San Francisco Housing Programs`, () => {
      cy.visit(`additional-resources?react=true`)
      cy.contains("San Francisco Housing Programs")
    })
    it(`displays Non-MOHCD housing programs`, () => {
      cy.visit(`additional-resources?react=true`)
      cy.contains("Non-MOHCD housing programs and resources")
    })
    it(`shows 9 item cards`, () => {
      cy.visit(`additional-resources?react=true`)
      cy.get(".info-card-additional-resources").should("have.length", 9)
    })
  })
})
