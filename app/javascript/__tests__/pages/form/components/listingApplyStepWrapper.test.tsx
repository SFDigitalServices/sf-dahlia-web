import React from "react"
import { t } from "@bloom-housing/ui-components"
import { render, screen } from "@testing-library/react"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import ListingApplyStepWrapper from "../../../../pages/form/components/ListingApplyStepWrapper"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import Name from "../../../../pages/form/components/Name"

describe("<ListingApplyStepWrapper />", () => {
  it("renders a form step and child components", () => {
    const fieldNames = ["firstName", "middleName", "lastName"]
    const listing = openRentalListing
    const formData = { testField: null }
    const formEngineContextValue = {
      listing,
      formData,
      saveFormData: jest.fn(),
      dataSources: {
        listing,
        form: formData,
        preferences: {},
      },
      stepInfoMap: [{ slug: "test", fieldNames }],
      sectionNames: [],
      currentStepIndex: 0,
      handleNextStep: jest.fn(),
      handlePrevStep: jest.fn(),
    }

    const title = "b1Name.title"
    const listingApplyStepWrapperProps = { title }

    const label = "label.yourName"
    const nameProps = {
      label: "label.yourName",
      fieldNames: {
        firstName: "label.firstName.sentenceCase",
        middleName: "label.middleName.sentenceCase",
        lastName: "label.lastName.sentenceCase",
      },
      showMiddleName: true,
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
