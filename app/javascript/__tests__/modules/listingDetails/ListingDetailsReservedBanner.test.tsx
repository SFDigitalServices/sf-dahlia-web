import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsReservedBanner } from "../../../modules/listingDetails/ListingDetailsReservedBanner"
import { RESERVED_COMMUNITY_TYPES } from "../../../modules/constants"

describe("ListingDetailsReservedBanner", () => {
  it("does not display banner when reserved community type is blank", () => {
    const tree = renderer.create(<ListingDetailsReservedBanner />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("does not display banner when unknown reserved community type", () => {
    const tree = renderer
      .create(<ListingDetailsReservedBanner reservedCommunityType={"anUnknownType"} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Accessible Units Only", () => {
    const tree = renderer
      .create(
        <ListingDetailsReservedBanner
          reservedCommunityType={RESERVED_COMMUNITY_TYPES.ACCESSIBLE_ONLY}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Artist Live/Work", () => {
    const tree = renderer
      .create(
        <ListingDetailsReservedBanner reservedCommunityType={RESERVED_COMMUNITY_TYPES.ARTIST} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("does not display banner when reserved community type is Habitat for Humanity", () => {
    const tree = renderer
      .create(
        <ListingDetailsReservedBanner reservedCommunityType={RESERVED_COMMUNITY_TYPES.HABITAT} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Senior", () => {
    const tree = renderer
      .create(
        <ListingDetailsReservedBanner
          reservedCommunityType={RESERVED_COMMUNITY_TYPES.SENIOR}
          reservedCommunityMinimumAge={65}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays banner when reserved community type is Veteran", () => {
    const tree = renderer
      .create(
        <ListingDetailsReservedBanner reservedCommunityType={RESERVED_COMMUNITY_TYPES.VETERAN} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
