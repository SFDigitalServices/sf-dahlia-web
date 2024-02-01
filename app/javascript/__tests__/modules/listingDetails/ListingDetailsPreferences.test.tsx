import React from "react"
import { render, cleanup } from "@testing-library/react"

import { ListingDetailsPreferences } from "../../../modules/listingDetails/ListingDetailsPreferences"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import { preferences as sixPreferences } from "../../data/RailsListingPreferences/lottery-preferences-six"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsPreferences", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("display 3 default preferences - COP, DTHP, L/W", (done) => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment } = render(<ListingDetailsPreferences listingID={"test"} />)

    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("display 6 preferences", (done) => {
    axios.get.mockResolvedValue({ data: { preferences: sixPreferences } })

    const { asFragment } = render(<ListingDetailsPreferences listingID={"test"} />)

    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
