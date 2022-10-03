import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsApply } from "../../../modules/listingDetailsAside/ListingDetailsApply"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("ListingDetailsApply", () => {
  it("does not render if listing is closed", () => {
    const tree = renderer.create(<ListingDetailsApply listing={closedRentalListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("renders if listing is open", () => {
    const tree = renderer.create(<ListingDetailsApply listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it(
    "displays habitat link for eligibility requirements when listing is habitat and is" + " open",
    () => {
      const openHabitatListing = {
        ...habitatListing,
        Application_Due_Date: "2032-12-02T01:00:00.000+0000",
      }

      const tree = renderer.create(<ListingDetailsApply listing={openHabitatListing} />).toJSON()

      expect(tree).toMatchSnapshot()
    }
  )
})
