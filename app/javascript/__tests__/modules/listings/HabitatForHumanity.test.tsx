import { render } from "@testing-library/react"
import { getHabitatContent } from "../../../modules/listings/HabitatForHumanity"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("HabitatForHumanity", () => {
  it("renders HabitatForHumanity component", () => {
    const { asFragment } = render(
      getHabitatContent(habitatListing, () => {
        return [{ unitType: { cellText: "" }, availability: { cellText: "" } }]
      })
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
