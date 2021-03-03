import React from "react"
import { render, cleanup } from "@testing-library/react"
import Hello from "../../pages/basic"

afterEach(cleanup)

describe("<Hello>", () => {
  it("shows right header text", () => {
    const { getByText } = render(
      <Hello />
    )

    expect(getByText("San Francisco Housing Portal")).not.toBeNull()
  })
})
