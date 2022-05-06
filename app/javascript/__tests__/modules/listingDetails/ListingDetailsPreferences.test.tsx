import React from "react"
import renderer, { act } from "react-test-renderer"

import { ListingDetailsPreferences } from "../../../modules/listingDetails/ListingDetailsPreferences"
import { preferences as defaultPreferences } from "../../data/lottery-preferences-default"
import { preferences as sixPreferences } from "../../data/lottery-preferences-six"

import { getPreferences } from "../../../api/listingApiService"

jest.mock("../../../api/listingApiService")

describe("ListingDetailsPreferences", () => {
  it("display 3 default preferences - COP, DTHP, L/W", async () => {
    const getPreferencesMock = getPreferences as jest.MockedFunction<typeof getPreferences>
    getPreferencesMock.mockReturnValue(Promise.resolve(defaultPreferences))

    const tree = renderer.create(<ListingDetailsPreferences listingID={"test"} />)

    // wait for state changes
    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it("display 6 preferences", async () => {
    const getPreferencesMock = getPreferences as jest.MockedFunction<typeof getPreferences>
    getPreferencesMock.mockReturnValue(Promise.resolve(sixPreferences))

    const tree = renderer.create(<ListingDetailsPreferences listingID={"test"} />)

    // wait for state changes
    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree.toJSON()).toMatchSnapshot()
  })
})
