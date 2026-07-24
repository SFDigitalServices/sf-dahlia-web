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
    render(<MetaTags />)
    // React 19 hoists <title> into the document head.
    expect(document.title).toEqual("DAHLIA San Francisco Housing Portal")
  })

  it("renders a description", () => {
    render(<MetaTags description="The Description" />)
    // React 19 hoists <meta> tags into the document head.
    const descriptionMeta = document.head.querySelector("meta[name='description']")
    expect(descriptionMeta?.getAttribute("content")).toEqual("The Description")
  })
})
