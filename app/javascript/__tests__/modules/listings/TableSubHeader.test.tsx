import React from "react"
import renderer from "react-test-renderer"
import TableSubHeader from "../../../modules/listings/TableSubHeader"

describe("TableSubHeader", () => {
  it("renders TableSubHeader component", () => {
    const tree = renderer.create(<TableSubHeader priorityTypes={["test"]} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
