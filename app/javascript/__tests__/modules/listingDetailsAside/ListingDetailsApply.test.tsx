import React from "react"
import { render, screen } from "@testing-library/react"
import { ListingDetailsApply } from "../../../modules/listingDetailsAside/ListingDetailsApply"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { setupUserContext } from "../../__util__/accountUtils"
import { getAddProfilePath } from "../../../util/routeUtil"

describe("ListingDetailsApply", () => {
  it("does not render if listing is closed", () => {
    const { asFragment } = render(<ListingDetailsApply listing={closedRentalListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("renders if listing is open", () => {
    const { asFragment } = render(<ListingDetailsApply listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it(
    "displays habitat link for eligibility requirements when listing is habitat and is" + " open",
    () => {
      const openHabitatListing = {
        ...habitatListing,
        Application_Due_Date: "2032-12-02T01:00:00.000+0000",
      }

      const { asFragment } = render(<ListingDetailsApply listing={openHabitatListing} />)

      expect(asFragment()).toMatchSnapshot()
    }
  )

  it("redirects signed in users without a completed profile to the add profile page", () => {
    setupUserContext({ loggedIn: true, hasProfile: false })

    render(<ListingDetailsApply listing={openSaleListing} />)

    expect(screen.getByRole("link", { name: /apply online/i })).toHaveAttribute(
      "href",
      getAddProfilePath()
    )
  })
})
