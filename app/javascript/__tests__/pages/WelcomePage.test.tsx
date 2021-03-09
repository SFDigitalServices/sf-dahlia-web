import React from "react"
import { render, cleanup } from "@testing-library/react"
import HomePage from "../../pages/WelcomePage"

afterEach(cleanup)

describe("<WelcomePage />", () => {
  it("shows right header text", () => {
    const { getByText } = render(
      <HomePage />
    )

    expect(getByText("San Francisco Housing Portal")).not.toBeNull()
  })
})
