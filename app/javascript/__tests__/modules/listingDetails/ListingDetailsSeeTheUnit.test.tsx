import React from "react"
import { render } from "@testing-library/react"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { saleEducatorListing } from "../../data/RailsSaleListing/listing-sale-educator"
import { onlineDetailsSaleListing } from "../../data/RailsSaleListing/listing-sale-online-details"
import { mlsOnlineDetailsSaleListing } from "../../data/RailsSaleListing/listing-sale-mls-online-details"
import { ListingDetailsSeeTheUnit } from "../../../modules/listingDetailsAside/ListingDetailsSeeTheUnit"

describe("ListingDetailsSeeTheUnit", () => {
  it("does not render SeeDetailsOnline when MLS and Listing_Online_Details are not set", () => {
    // saleEducatorListing does not have Multiple_Listing_Service_URL and Listing_Online_Details
    const { asFragment } = render(<ListingDetailsSeeTheUnit listing={saleEducatorListing} />)

    // this snapshot should not include SeeDetailsOnline
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders SeeDetailsOnline when only MLS is set", () => {
    // openSaleListing has Multiple_Listing_Service_URL defined
    const { asFragment } = render(<ListingDetailsSeeTheUnit listing={openSaleListing} />)

    // this snapshot should include SeeDetailsOnline with only the MLS link
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders SeeDetailsOnline when only Listing_Online_Details is set", () => {
    // onlineDetailsSaleListing has Listing_Online_Details defined
    const { asFragment } = render(<ListingDetailsSeeTheUnit listing={onlineDetailsSaleListing} />)

    // this snapshot should include SeeDetailsOnline with only the Listing_Online_Details link
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders SeeDetailsOnline when both MLS and Listing_Online_Details are set", () => {
    // mlsOnlineDetailsSaleListing has both MLS and Listing_Online_Details defined
    const { asFragment } = render(
      <ListingDetailsSeeTheUnit listing={mlsOnlineDetailsSaleListing} />
    )

    // this snapshot should include SeeDetailsOnline with both MLS and Listing_Online_Details links
    expect(asFragment()).toMatchSnapshot()
  })
})
