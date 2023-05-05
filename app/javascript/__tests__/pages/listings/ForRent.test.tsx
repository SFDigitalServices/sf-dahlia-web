import React from "react"
import { render, cleanup } from "@testing-library/react"
import ForRent from "../../../../javascript/pages/listings/for-rent"

const axios = require("axios")

jest.mock("axios")

describe("For Rent", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders ForRent component", async (done) => {
    axios.get.mockResolvedValue({ data: { listings: [] } })

    const { findByText, asFragment } = render(<ForRent assetPaths="/" />)

    expect(await findByText("Rent affordable housing")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
