import renderer from "react-test-renderer"
import { getHabitatContent } from "../../../modules/listings/HabitatForHumanity"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("ListingDetailsHabitat", () => {
  it("does not display when not habitat listing", () => {
    const tree = renderer
      .create(
        getHabitatContent(habitatListing, () => {
          return [{ unitType: { cellText: "" }, availability: { cellText: "" } }]
        })
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
