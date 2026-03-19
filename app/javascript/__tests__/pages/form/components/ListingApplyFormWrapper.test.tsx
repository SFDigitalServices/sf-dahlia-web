import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import ListingApplyFormWrapper from "../../../../pages/form/components/ListingApplyFormWrapper"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("ListingApplyFormWrapper", () => {
  it("renders with layout when hideLayout is omitted", () => {
    renderWithFormContextWrapper(
      <ListingApplyFormWrapper currentStepIndex={0}>
        <div>Step One Content</div>
      </ListingApplyFormWrapper>,
      {
        renderForm: false,
        staticData: { listing: openRentalListing },
        stepInfoMap: [{ slug: "step-one", fieldNames: [] }],
      }
    )
    expect(
      screen.queryByText(t("pageTitle.listingApplication", { listing: openRentalListing.Name }))
    ).not.toBeNull()
  })

  it("renders without layout when hideLayout is true", () => {
    renderWithFormContextWrapper(
      <ListingApplyFormWrapper currentStepIndex={0}>
        <div>Step One Content</div>
      </ListingApplyFormWrapper>,
      {
        renderForm: false,
        staticData: { listing: openRentalListing },
        stepInfoMap: [{ slug: "step-one", fieldNames: [], hideLayout: true }],
      }
    )
    expect(
      screen.queryByText(t("pageTitle.listingApplication", { listing: openRentalListing.Name }))
    ).toBeNull()
  })

  it("renders the progress nav", () => {
    renderWithFormContextWrapper(
      <ListingApplyFormWrapper currentStepIndex={0}>
        <div>Step One Content</div>
      </ListingApplyFormWrapper>,
      {
        renderForm: false,
        stepInfoMap: [{ slug: "step-one", fieldNames: [] }],
      }
    )
    expect(screen.getByLabelText("progress")).not.toBeNull()
  })
})
