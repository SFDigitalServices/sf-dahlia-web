import React from "react"
import renderer, { act } from "react-test-renderer"
import { ListingDetailsPricingTable } from "../../../modules/listingDetails/ListingDetailsPricingTable"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
// leaving the habitat listing test commented out - should be needed very soon.
// import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { pricingTableUnits } from "../../data/RailsListingPricingTableUnits/listing-pricing-table-units-default"
import { getListingPricingTableUnits } from "../../../api/listingApiService"

jest.mock("../../../api/listingApiService")

describe("ListingDetailsPricingTable", () => {
  it("renders ListingDetailsPricingTable component with spinner before api call", () => {
    const getListingPricingTableUnitsMock = getListingPricingTableUnits as jest.MockedFunction<
      typeof getListingPricingTableUnits
    >

    getListingPricingTableUnitsMock.mockReturnValue(Promise.resolve(pricingTableUnits))

    const tree = renderer.create(<ListingDetailsPricingTable listing={closedRentalListing} />)

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component", async () => {
    const getListingPricingTableUnitsMock = getListingPricingTableUnits as jest.MockedFunction<
      typeof getListingPricingTableUnits
    >

    getListingPricingTableUnitsMock.mockReturnValue(Promise.resolve(pricingTableUnits))

    const tree = renderer.create(<ListingDetailsPricingTable listing={closedRentalListing} />)

    /* wait for state changes. The Promise ensures that we wait for all Promises to resolve
    and any state changes to finish */
    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree.toJSON()).toMatchSnapshot()
  })

  // it("does not render ListingDetailsPricingTable when habitat listing", async () => {
  //   const getListingPricingTableUnitsMock = getListingPricingTableUnits as jest.MockedFunction<
  //     typeof getListingPricingTableUnits
  //   >

  //   getListingPricingTableUnitsMock.mockReturnValue(Promise.resolve(pricingTableUnits))

  //   const tree = renderer.create(<ListingDetailsPricingTable listing={habitatListing} />)

  //   await act(() => new Promise((resolve) => setTimeout(resolve)))

  //   expect(tree.toJSON()).toMatchSnapshot()
  // })
})
