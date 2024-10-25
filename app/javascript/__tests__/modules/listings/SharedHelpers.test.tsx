import { getImageCardProps, getListingStatuses } from "../../../modules/listings/SharedHelpers"
import { ApplicationStatusType, StatusBarType } from "@bloom-housing/ui-components"
import type RailsRentalListing from "../../../api/types/rails/listings/RailsRentalListing"
import { notYetOpenSaleFcfsListing } from "../../data/RailsSaleListing/listing-sale-fcfs-not-yet-open"
import { closedFcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs-closed"
import { openFcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs-open"

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
            content: "Application Deadline: January 1, 2050",
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
            content: "Application Deadline: January 1, 2050",
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
            content: "Application Deadline: January 1, 2050",
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
  describe("getListingStatuses", () => {
    it("returns closed if not accepting online applications", () => {
      // given
      const expectedStatus = {
        status: ApplicationStatusType.Closed,
        content: "Applications closed",
        subContent: "First come, first served",
        hideIcon: true,
      }

      // when
      const statusBarTypes: StatusBarType[] = getListingStatuses(closedFcfsSaleListing, false)

      // then
      expect(statusBarTypes).toHaveLength(1)
      expect(statusBarTypes[0]).toStrictEqual(expectedStatus)
    })
    it("returns not yet open if application start date is in the future", () => {
      // given
      const expectedStatus = {
        status: ApplicationStatusType.Open,
        content: "Applications open: January 1, 2050",
        subContent: "First come, first served",
      }

      // when
      const statusBarTypes: StatusBarType[] = getListingStatuses(notYetOpenSaleFcfsListing, false)

      // then
      expect(statusBarTypes).toHaveLength(1)
      expect(statusBarTypes[0]).toStrictEqual(expectedStatus)
    })
    it("returns open if application start date is in the past", () => {
      // given
      const expectedStatus = {
        status: ApplicationStatusType.Open,
        content: "Applications open",
        subContent: "First come, first served",
      }

      // when
      const statusBarTypes: StatusBarType[] = getListingStatuses(openFcfsSaleListing, false)

      // then
      expect(statusBarTypes).toHaveLength(1)
      expect(statusBarTypes[0]).toStrictEqual(expectedStatus)
    })
  })
})
