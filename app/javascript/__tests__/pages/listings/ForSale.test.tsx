import React from "react"
import { render, cleanup } from "@testing-library/react"
import ForSale from "../../../pages/listings/for-sale"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

const axios = require("axios")

jest.mock("axios")

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock Helmet component
  }
})

describe("For Sale", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders ForSale component", async (done) => {
    axios.get.mockResolvedValue({ data: { listings: [] } })

    const { findByText, asFragment } = render(<ForSale assetPaths="/" />)

    expect(await findByText("Buy affordable housing")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("listings with multiple listings render the first image in the array", async (done) => {
    axios.get.mockResolvedValue({ data: { listings: [openSaleListing] } })

    const { findByAltText } = render(<ForSale assetPaths="/" />)

    const image = await findByAltText(`${openSaleListing.Building_Name} Building`)
    expect(image.getAttribute("src")).toBe(openSaleListing.Listing_Images[0].Image_URL)
    done()
  })
})
