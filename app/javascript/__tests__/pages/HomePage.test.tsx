import React from "react"

import { render, cleanup } from "@testing-library/react"

import HomePage from "../../pages/HomePage"

afterEach(cleanup)

describe("<HomePage />", () => {
  it("shows right header text", () => {
    const { getByText } = render(<HomePage />)

    expect(getByText("San Francisco Housing Portal")).not.toBeNull()
  })
})
