import React from "react"

import { render } from "@testing-library/react"

import Link from "../../navigation/Link"

describe("<Link />", () => {
  it("renders a link with the correct text", () => {
    const { getByText } = render(<Link href="/test">Test link</Link>)
    expect(getByText("Test link")).not.toBeNull()
  })
})
