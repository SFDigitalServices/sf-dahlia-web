import React from "react"
import { render } from "@testing-library/react"
import MetaTags from "../../layouts/MetaTags"

describe("<MetaTags />", () => {
  it("renders a title correctly", () => {
    render(<MetaTags title="The Title" />)
    expect(document.title).toEqual("The Title")
  })

  it("renders a default title", () => {
    const { getByText } = render(<MetaTags />)
    expect(getByText("DAHLIA San Francisco Housing Portal")).toBeInTheDocument()
  })

  it("renders a description", () => {
    const { container } = render(<MetaTags description="The Description" />)
    expect(container.querySelector("meta[name='description']").getAttribute("content")).toEqual(
      "The Description"
    )
  })
})
