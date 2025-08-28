/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t } from "@bloom-housing/ui-components"
import { render, screen } from "@testing-library/react"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import ListingApplyStepWrapper from "../../../../pages/form/components/listingApplyStepWrapper"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import Name from "../../../../pages/form/components/name"

describe("<ListingApplyStepWrapper />", () => {
  it("renders a form step and child components", () => {
    const fieldNames = ["firstName", "middleName", "lastName"]
    const formEngineContextValue = {
      listingData: openRentalListing,
      formData: { testField: null },
      saveFormData: jest.fn(),
      stepInfoMap: [{ slug: "test", fieldNames }],
      sectionNames: [],
      currentStepIndex: 0,
      handleNextStep: jest.fn(),
      handlePrevStep: jest.fn(),
    }

    const title = "b1Name.title"
    const listingApplyStepWrapperProps = { title }

    const label = "label.name"
    const nameProps = {
      label: "label.name",
      fieldNames: { firstName: "test", middleName: "test", lastName: "test" },
    }

    render(
      <FormEngineProvider value={formEngineContextValue}>
        <ListingApplyStepWrapper {...listingApplyStepWrapperProps}>
          <Name {...nameProps} />
        </ListingApplyStepWrapper>
      </FormEngineProvider>
    )
    expect(screen.getByText(t(title))).not.toBeNull()
    expect(screen.getByText(t(label))).not.toBeNull()
  })
})
