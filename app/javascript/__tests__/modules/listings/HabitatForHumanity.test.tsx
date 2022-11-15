import renderer from "react-test-renderer"
import { getHabitatContent } from "../../../modules/listings/HabitatForHumanity"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("HabitatForHumanity", () => {
  it("renders HabitatForHumanity component", () => {
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
