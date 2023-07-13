import { getImageCardProps } from "../../../modules/listings/SharedHelpers"
import type RailsRentalListing from "../../../api/types/rails/listings/RailsRentalListing"

describe("SharedHelpers", () => {
  describe("getImageCardProps", () => {
    describe("with no imageURL", () => {
      it("returns an object with fallback image", () => {
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
    })
  })
})
