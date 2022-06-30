import { getImageCardProps } from "../../../modules/listings/SharedHelpers"
import RailsRentalListing from "../../../api/types/rails/listings/RailsRentalListing"

describe("SharedHelpers", () => {
  describe("getImageCardProps", () => {
    describe("with no imageURL", () => {
      it("returns an object with fallback image", () => {
        const listing = {
          imageURL: null,
        }
        expect(getImageCardProps(listing as RailsRentalListing)).toMatchObject({
          href: "/listings/undefined",
          imageUrl: {},
          statuses: [
            {
              content: "Application Deadline: June 30, 2022",
              status: 0,
            },
          ],
          tags: undefined,
        })
      })
    })
  })
})
