import React from "react"
import { render } from "@testing-library/react"
import TableSubHeader from "../../../modules/listings/TableSubHeader"
import { t } from "@bloom-housing/ui-components"
import { rentalEducatorListing2 } from "../../data/RailsRentalListing/listing-rental-educator"
import RailsRentalListing from "../../../api/types/rails/listings/RailsRentalListing"

describe("TableSubHeader", () => {
  it("renders the priority units for Shirley Chisholm listing 2", async () => {
    const { asFragment, findByText } = render(<TableSubHeader listing={rentalEducatorListing2} />)
    expect(await findByText(t("listings.customListingType.educator.priorityUnits"))).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders the priority units for Shirley Chisholm listing 2 with other priority units", async () => {
    const testListing = {
      Custom_Listing_Type: "Educator 2: SFUSD employees & public",
      prioritiesDescriptor: [
        {
          name: "Mobility/Hearing/Vision impairments",
        },
      ],
    }
    const { asFragment, findByText } = render(
      <TableSubHeader listing={testListing as RailsRentalListing} />
    )
    expect(await findByText(t("listings.customListingType.educator.priorityUnits"))).toBeDefined()
    expect(await findByText(t("listings.prioritiesDescriptor.mobilityHearingVision"))).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })
})
