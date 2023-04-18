import React from "react"
import renderer from "react-test-renderer"
import ForRent from "../../../../javascript/pages/listings/for-rent"
jest.useFakeTimers()

describe("For Rent", () => {
  it("renders ForRent component", () => {
    const tree = renderer.create(<ForRent assetPaths="/" />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
