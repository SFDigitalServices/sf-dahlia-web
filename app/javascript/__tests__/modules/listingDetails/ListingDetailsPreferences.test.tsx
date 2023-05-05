import React from "react"
import { render } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"

import { ListingDetailsPreferences } from "../../../modules/listingDetails/ListingDetailsPreferences"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import { preferences as sixPreferences } from "../../data/RailsListingPreferences/lottery-preferences-six"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsPreferences", () => {
  it("display 3 default preferences - COP, DTHP, L/W", async (done) => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(<ListingDetailsPreferences listingID={"test"} />)

    expect(
      await findByText(t("listings.lotteryPreference.remainingUnitsAfterPreferenceConsideration"))
    ).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("display 6 preferences", async (done) => {
    axios.get.mockResolvedValue({ data: { preferences: sixPreferences } })

    const { asFragment, findByText } = render(<ListingDetailsPreferences listingID={"test"} />)

    expect(
      await findByText(t("listings.lotteryPreference.remainingUnitsAfterPreferenceConsideration"))
    ).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
