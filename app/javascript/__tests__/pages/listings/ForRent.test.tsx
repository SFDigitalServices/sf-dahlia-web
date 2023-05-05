import React from "react"
import { render, cleanup } from "@testing-library/react"
import ForRent from "../../../../javascript/pages/listings/for-rent"

// eslint-disable-next-line unicorn/prefer-module
const axios = require("axios")

jest.useRealTimers()
jest.mock("axios")

describe("For Rent", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders ForRent component", async (done) => {
    jest.setTimeout(30_000)
    axios.get.mockResolvedValue({ data: { listings: [] } })

    const { findByTestId, asFragment } = render(<ForRent assetPaths="/" />)

    expect(await findByTestId("Rent-0")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
