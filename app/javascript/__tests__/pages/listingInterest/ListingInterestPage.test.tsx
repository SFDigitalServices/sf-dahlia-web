import React from "react"
import ListingInterestPage from "../../../../javascript/pages/listingInterest/listing-interest-page"
import { renderAndLoadAsync } from "../../__util__/renderUtils"

describe("Listing Interest Page", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
  })

  it("renders listing interest page with yes response", async () => {
    const { asFragment } = await renderAndLoadAsync(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "y" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("renders listing interest page with no response", async () => {
    const { asFragment } = await renderAndLoadAsync(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "n" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("renders listing interest page with expired response", async () => {
    const { asFragment } = await renderAndLoadAsync(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "x" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("renders listing interest page with error response", async () => {
    const { asFragment } = await renderAndLoadAsync(
      <ListingInterestPage
        assetPaths="/"
        urlParams={{ listing: "a0W0P00000DZYzVUAX", response: "e" }}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
