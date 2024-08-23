import { getImageCardProps } from "../../../modules/listings/SharedHelpers"
import type RailsRentalListing from "../../../api/types/rails/listings/RailsRentalListing"

describe("SharedHelpers", () => {
  describe("getImageCardProps", () => {
    it("returns an object with fallback image when listing has no imageURL", () => {
      const listing = {
        Application_Due_Date: "2050-01-01T01:00:00.000+0000",
        imageURL: null,
      }
      expect(getImageCardProps(listing as RailsRentalListing)).toMatchObject({
        href: "/listings/undefined",
        imageUrl: {},
        statuses: [
          {
            content: "Application deadline: January 1, 2050",
            status: 0,
          },
        ],
        tags: undefined,
      })
    })

    it("returns an object with image tags for custom listing type", () => {
      const listing = {
        Application_Due_Date: "2050-01-01T01:00:00.000+0000",
        imageURL: null,
        Custom_Listing_Type: "Educator 1: SFUSD employees only",
      }
      expect(getImageCardProps(listing as RailsRentalListing)).toMatchObject({
        href: "/listings/undefined",
        imageUrl: {},
        statuses: [
          {
            content: "Application deadline: January 1, 2050",
            status: 0,
          },
        ],
        tags: [
          {
            text: "SF public schools employee housing",
          },
        ],
      })
    })

    it("returns an object with image tags for reserved community type", () => {
      const listing = {
        Application_Due_Date: "2050-01-01T01:00:00.000+0000",
        imageURL: null,
        Reserved_community_type: "Habitat for Humanity",
      }
      expect(getImageCardProps(listing as RailsRentalListing)).toMatchObject({
        href: "/listings/undefined",
        imageUrl: {},
        statuses: [
          {
            content: "Application deadline: January 1, 2050",
            status: 0,
          },
        ],
        tags: [
          {
            text: "Habitat Greater San Francisco",
          },
        ],
      })
    })
  })
})
