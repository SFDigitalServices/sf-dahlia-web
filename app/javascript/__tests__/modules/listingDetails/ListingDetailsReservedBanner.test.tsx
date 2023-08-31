import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsReservedBanner } from "../../../modules/listingDetails/ListingDetailsReservedBanner"
import { CUSTOM_LISTING_TYPES, RESERVED_COMMUNITY_TYPES } from "../../../modules/constants"

describe("ListingDetailsReservedBanner", () => {
  it("does not display banner when reserved community and custom listing types are blank", () => {
    const { asFragment } = render(<ListingDetailsReservedBanner />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display banner when unknown reserved community type", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner reservedCommunityType={"anUnknownType"} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Accessible Units Only", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner
        reservedCommunityType={RESERVED_COMMUNITY_TYPES.ACCESSIBLE_ONLY}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Artist Live/Work", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner reservedCommunityType={RESERVED_COMMUNITY_TYPES.ARTIST} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display banner when reserved community type is Habitat for Humanity", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner reservedCommunityType={RESERVED_COMMUNITY_TYPES.HABITAT} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Senior", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner
        reservedCommunityType={RESERVED_COMMUNITY_TYPES.SENIOR}
        reservedCommunityMinimumAge={65}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Veteran", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner reservedCommunityType={RESERVED_COMMUNITY_TYPES.VETERAN} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display banner when custom listing type is unknown", () => {
    const { asFragment } = render(<ListingDetailsReservedBanner customListingType="unknown" />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays banner when custom listing type is Educator One", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner customListingType={CUSTOM_LISTING_TYPES.EDUCATOR_ONE} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays custom listing type banner when both custom listing and reserved community types are selected", () => {
    const { asFragment } = render(
      <ListingDetailsReservedBanner
        reservedCommunityType={RESERVED_COMMUNITY_TYPES.VETERAN}
        customListingType={CUSTOM_LISTING_TYPES.EDUCATOR_ONE}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
