import React from "react"
import renderer from "react-test-renderer"
import TableSubHeader from "../../../modules/listings/TableSubHeader"

describe("TableSubHeader", () => {
  it("renders TableSubHeader component", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })
    const tree = renderer.create(<TableSubHeader priorityTypes={["test"]} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
