import React from "react"
import { render, cleanup } from "@testing-library/react"
import WelcomePage from "../../pages/WelcomePage"

afterEach(cleanup)

describe("<WelcomePage />", () => {
  it("shows right header text", () => {
    const { getByText } = render(
      <WelcomePage />
    )

    expect(getByText("San Francisco Housing Portal")).not.toBeNull()
  })
})
