import React from "react"
import { render } from "@testing-library/react"
import MetaTags from "../../layouts/MetaTags"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
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
    const descriptionMeta = container.querySelector("meta[name='description']")
    expect(descriptionMeta?.getAttribute("content")).toEqual("The Description")
  })
})
