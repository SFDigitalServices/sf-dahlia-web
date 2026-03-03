import React from "react"
import { t } from "@bloom-housing/ui-components"
import { render, screen } from "@testing-library/react"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import ListingApplyHouseholdIntro from "../../../../pages/form/components/ListingApplyHouseholdIntro"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import userEvent from "@testing-library/user-event"

describe("ListingApplyHouseholdIntro", () => {
  const formEngineContextValue = {
    listing: openRentalListing,
    formData: {},
    saveFormData: jest.fn(),
    dataSources: {
      listing: openRentalListing,
      form: {},
      preferences: {},
    },
    stepInfoMap: [{ slug: "test", fieldNames: [] }],
    sectionNames: [],
    currentStepIndex: 0,
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
    jumpToStep: jest.fn(),
  }

  beforeEach(() => {
    render(
      <FormEngineProvider value={formEngineContextValue}>
        <ListingApplyHouseholdIntro />
      </FormEngineProvider>
    )
  })

  const user = userEvent.setup()
  it("renders the component", () => {
    expect(screen.getByText(t("c1HouseholdIntro.title"))).not.toBeNull()
  })
  it("skips to the next section if alone", async () => {
    await user.click(screen.getByText(t("label.liveAlone")))
    expect(formEngineContextValue.jumpToStep).toHaveBeenCalledWith("household-public-housing")
  })
  it("goes to the next page if there are household members", async () => {
    await user.click(screen.getByText(t("label.otherPeople")))
    expect(formEngineContextValue.handleNextStep).toHaveBeenCalled()
    expect(formEngineContextValue.jumpToStep).not.toHaveBeenCalled()
  })
})
