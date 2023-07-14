import React from "react"
import { render } from "@testing-library/react"
import TableSubHeader from "../../../modules/listings/TableSubHeader"

describe("TableSubHeader", () => {
  it("renders TableSubHeader component", () => {
    const { asFragment } = render(<TableSubHeader priorityTypes={["test"]} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
