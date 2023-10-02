import React from "react"
import { render } from "@testing-library/react"
import TableSubHeader from "../../../modules/listings/TableSubHeader"
import { t } from "@bloom-housing/ui-components"
import { rentalEducatorListing2 } from "../../data/RailsRentalListing/listing-rental-educator"

describe("TableSubHeader", () => {
  it("renders the priority units for Shirley Chisholm listing 2", async (done) => {
    const { asFragment, findByText } = render(<TableSubHeader listing={rentalEducatorListing2} />)
    expect(await findByText(t("listings.customListingType.educator.priorityUnits"))).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
