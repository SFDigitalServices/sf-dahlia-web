import React from "react"
import { render, cleanup } from "@testing-library/react"
import ForSale from "../../../pages/listings/for-sale"

const axios = require("axios")

jest.useRealTimers()
jest.mock("axios")

describe("For Sale", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders ForSale component", async (done) => {
    jest.setTimeout(30_000)
    axios.get.mockResolvedValue({ data: { listings: [] } })

    const { findByTestId, asFragment } = render(<ForSale assetPaths="/" />)

    expect(await findByTestId("Rent-0")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
