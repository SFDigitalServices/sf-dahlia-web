import React from "react"
import renderer from "react-test-renderer"
import ForSale from "../../../pages/listings/for-sale"

describe("For Sale", () => {
  it("renders ForSale component", () => {
    const tree = renderer.create(<ForSale assetPaths="/" />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
