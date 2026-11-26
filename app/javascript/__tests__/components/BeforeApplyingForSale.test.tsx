import React from "react"
import { render, screen } from "@testing-library/react"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"

describe("BeforeApplyingForSale", () => {
  it("display Before Applying when type is directory", () => {
    const { asFragment } = render(
      <BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.DIRECTORY} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("display Before Applying when type is listing detail", () => {
    const { asFragment } = render(
      <BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.LISTING_DETAILS} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("display Before Applying when type is Habitat listing detail", () => {
    const { asFragment } = render(
      <BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.LISTING_DETAILS_HABITAT} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  // Given a Habitat listing with a Building Selection Criteria URL
  // When I view the "Before applying" list in the Eligibility section
  // Then "our full list of requirements" links to that URL
  it("links the Habitat full list of requirements to the Building Selection Criteria URL", () => {
    const buildingSelectionCriteriaUrl = "https://example.org/building-selection-criteria"

    render(
      <BeforeApplyingForSale
        beforeApplyingType={BeforeApplyingType.LISTING_DETAILS_HABITAT}
        buildingSelectionCriteriaUrl={buildingSelectionCriteriaUrl}
      />
    )

    expect(screen.getByRole("link", { name: "our full list of requirements" })).toHaveAttribute(
      "href",
      buildingSelectionCriteriaUrl
    )
  })
})
