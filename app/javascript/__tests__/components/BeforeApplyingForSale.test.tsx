import React from "react"
import { render } from "@testing-library/react"
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
})
