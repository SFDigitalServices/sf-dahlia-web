import React from "react"
import { render } from "@testing-library/react"
import MetaTags from "../../layouts/MetaTags"

jest.mock("react-helmet-async", () => {
  return {
    // eslint-disable-next-line react/prop-types
    HelmetProvider: ({ children }) => <div>{children}</div>, // Mock HelmetProvider
    // eslint-disable-next-line react/prop-types
    Helmet: ({ children }) => <div>{children}</div>, // Mock Helmet component
  }
})

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
