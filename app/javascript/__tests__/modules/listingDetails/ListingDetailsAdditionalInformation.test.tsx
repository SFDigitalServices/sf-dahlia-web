import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsAdditionalInformation } from "../../../modules/listingDetails/ListingDetailsAdditionalInformation"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

describe("ListingDetailsAdditionalInformation", () => {
  it("displays additional information section for a sale listing", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })
    const tree = renderer
      .create(
        <ListingDetailsAdditionalInformation listing={openSaleListing} imageSrc={"/image-url"} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays additional information section for a rental listing", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })
    const tree = renderer
      .create(
        <ListingDetailsAdditionalInformation
          listing={closedRentalListing}
          imageSrc={"/image-url"}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
