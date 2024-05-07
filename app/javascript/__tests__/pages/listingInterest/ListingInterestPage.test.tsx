import React from "react"
import { render } from "@testing-library/react"
import ListingInterestPage from "../../../../javascript/pages/listingInterest/listing-interest-page"

describe("Listing Interest Page", () => {
  it("renders listing interest page with yes response", () => {
    const { asFragment } = render(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "y" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("renders listing interest page with no response", () => {
    const { asFragment } = render(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "n" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("renders listing interest page with expired response", () => {
    const { asFragment } = render(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "x" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("renders listing interest page with error response", () => {
    const { asFragment } = render(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "e" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
