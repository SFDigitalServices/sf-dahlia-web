import React from "react"
import renderer from "react-test-renderer"
import { lotteryCompleteRentalListing } from "../data/RailsRentalListing/listing-rental-lottery-complete"
import OpenHouses from "../../components/OpenHouses"

describe("OpenHouses", () => {
  it("displays OpenHouses with Listing containing Open_Houses", () => {
    const tree = renderer.create(<OpenHouses listing={lotteryCompleteRentalListing} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("doesn't display anything with Listing not containing Open_Houses", () => {
    const listing = { ...lotteryCompleteRentalListing, Open_Houses: [] }
    const tree = renderer.create(<OpenHouses listing={listing} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
