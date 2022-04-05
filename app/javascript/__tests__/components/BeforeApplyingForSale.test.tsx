import React from "react"
import renderer from "react-test-renderer"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"

describe("BeforeApplyingForSale", () => {
  it("display Before Applying when type is directory", () => {
    const tree = renderer
      .create(<BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.DIRECTORY} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("display Before Applying when type is listing detail", () => {
    const tree = renderer
      .create(<BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.LISTING_DETAILS} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("display Before Applying when type is Habitat listing detail", () => {
    const tree = renderer
      .create(
        <BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.LISTING_DETAILS_HABITAT} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
