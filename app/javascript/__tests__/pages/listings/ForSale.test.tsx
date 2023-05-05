import React from "react"
import { render, cleanup } from "@testing-library/react"
import ForSale from "../../../pages/listings/for-sale"

const axios = require("axios")

jest.mock("axios")

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
})
