import React from "react"
import { cleanup, waitFor } from "@testing-library/react"

import { ListingDetailsPreferences } from "../../../modules/listingDetails/ListingDetailsPreferences"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import { preferences as sixPreferences } from "../../data/RailsListingPreferences/lottery-preferences-six"
import { renderAndLoadAsync } from "../../__util__/renderUtils"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsPreferences", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("display 3 default preferences - COP, DTHP, L/W", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, getByText } = await renderAndLoadAsync(
      <ListingDetailsPreferences listingID={"test"} />
    )

    await waitFor(() => getByText("Certificate of Preference (COP)"))
    expect(asFragment()).toMatchSnapshot()
  })

  it("display 6 preferences", async () => {
    axios.get.mockResolvedValue({ data: { preferences: sixPreferences } })

    const { asFragment, getByText } = await renderAndLoadAsync(
      <ListingDetailsPreferences listingID={"test"} />
    )

    await waitFor(() => getByText("Certificate of Preference (COP)"))
    expect(asFragment()).toMatchSnapshot()
  })
})
