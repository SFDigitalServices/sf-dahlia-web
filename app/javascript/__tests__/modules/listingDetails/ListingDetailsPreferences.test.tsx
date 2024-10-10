import React from "react"
import { waitFor } from "@testing-library/react"

import { ListingDetailsPreferences } from "../../../modules/listingDetails/ListingDetailsPreferences"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import { preferences as sixPreferences } from "../../data/RailsListingPreferences/lottery-preferences-six"
import { preferences as rtrPreferences } from "../../data/RailsListingPreferences/lottery-preferences-rtr"
import { renderAndLoadAsync } from "../../__util__/renderUtils"

describe("ListingDetailsPreferences", () => {
  it("display 3 default preferences - COP, DTHP, L/W", async () => {
    const { asFragment, getByText } = await renderAndLoadAsync(
      <ListingDetailsPreferences preferences={defaultPreferences} />
    )

    await waitFor(() => getByText("Certificate of Preference (COP)"))
    expect(asFragment()).toMatchSnapshot()
  })

  it("display 6 preferences", async () => {
    const { asFragment, getByText } = await renderAndLoadAsync(
      <ListingDetailsPreferences preferences={sixPreferences} />
    )

    await waitFor(() => getByText("Certificate of Preference (COP)"))
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays right to return preference", async () => {
    const { asFragment, getByText } = await renderAndLoadAsync(
      <ListingDetailsPreferences preferences={rtrPreferences} />
    )

    await waitFor(() => getByText("Right to Return - Sunnydale"))
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays spinner when no preferences", async () => {
    const noPreferences = []
    const { asFragment } = await renderAndLoadAsync(
      <ListingDetailsPreferences preferences={noPreferences} />
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
