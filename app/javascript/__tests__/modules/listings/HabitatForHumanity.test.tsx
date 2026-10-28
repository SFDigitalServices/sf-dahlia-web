import { render } from "@testing-library/react"
import { getHabitatContent } from "../../../modules/listings/HabitatForHumanity"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("HabitatForHumanity", () => {
  it("renders HabitatForHumanity component", () => {
    const { asFragment } = render(
      getHabitatContent(habitatListing, () => {
        return [{ unitType: { cellText: "", cellSubText: "1 available" } }]
      })
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("renders HabitatForHumanity component when stackedData is null", () => {
    expect(() =>
      render(
        getHabitatContent(habitatListing, () => {
          return null
        })
      )
    ).not.toThrow()
  })
})
