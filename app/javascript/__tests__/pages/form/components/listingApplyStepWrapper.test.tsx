import React from "react"
import { t } from "@bloom-housing/ui-components"
import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import ListingApplyStepWrapper from "../../../../pages/form/components/ListingApplyStepWrapper"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import Phone from "../../../../pages/form/components/Phone"

const buildFormEngineContextValue = (
  fieldNames: string[],
  formData: Record<string, unknown> = {}
) => {
  return {
    sessionId: "test-session-id",
    formData,
    saveFormData: jest.fn(),
    staticData: {
      openRentalListing,
      preferences: [],
      preferenceNames: {},
    },
    stepInfoMap: [{ slug: "test", fieldNames }],
    sectionNames: [],
    currentStepIndex: 0,
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
    jumpToStep: jest.fn(),
  }
}

describe("<ListingApplyStepWrapper />", () => {
  it("renders a form step and child components", () => {
    const fieldNames = ["firstName", "middleName", "lastName"]
    const formData = { testField: null }
    const formEngineContextValue = buildFormEngineContextValue(fieldNames, formData)

    const title = "b1Name.title"
    const label = "label.applicantPhone"
    const phoneProps = {
      label,
      fieldNames: {
        phone: "phone",
      },
    }
    render(
      <FormEngineProvider value={formEngineContextValue}>
        <ListingApplyStepWrapper title={title}>
          <Phone {...phoneProps} />
        </ListingApplyStepWrapper>
      </FormEngineProvider>
    )

    expect(screen.getByText(t(title))).not.toBeNull()
    expect(screen.getByText(t(label))).not.toBeNull()
  })

  it("clears de-registered field values by merging blankValues into saveFormData", async () => {
    const user = userEvent.setup()
    const fieldNames = ["phone", "additionalPhone"]
    const formEngineContextValue = buildFormEngineContextValue(fieldNames)
    const phoneProps = {
      label: "label.applicantPhone",
      fieldNames: {
        phone: "phone",
        additionalPhone: "additionalPhone",
      },
      showAdditionalPhoneNumber: false,
    }
    render(
      <FormEngineProvider value={formEngineContextValue}>
        <ListingApplyStepWrapper title="b1Name.title">
          <Phone {...phoneProps} />
        </ListingApplyStepWrapper>
      </FormEngineProvider>
    )

    await user.type(screen.getByRole("textbox"), "1234567890")
    await user.click(screen.getByRole("button", { name: t("t.next") }))
    await waitFor(() => {
      expect(formEngineContextValue.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: "(123) 456-7890",
          additionalPhone: null,
        })
      )
    })
  })
})
