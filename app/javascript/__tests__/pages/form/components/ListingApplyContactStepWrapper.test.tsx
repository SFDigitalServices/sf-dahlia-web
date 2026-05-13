import React from "react"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import ListingApplyContactStepWrapper from "../../../../pages/form/components/ListingApplyContactStepWrapper"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import { locateVerifiedAddress } from "../../../../api/formApiService"

jest.mock("../../../../api/formApiService", () => ({
  locateVerifiedAddress: jest.fn(),
}))

const mockLocateVerifiedAddress = locateVerifiedAddress as jest.Mock

Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
})
Element.prototype.scrollTo = jest.fn()

const renderListingApplyContactStepWrapper = (formData: Record<string, unknown> = {}) => {
  const { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData } = renderWithFormContextWrapper(
    <ListingApplyContactStepWrapper
      title="b2Contact.title"
      titleVars={{ name: { dataSource: "form", dataKey: "name" } }}
      fieldNames={{
        phone: "phone",
        phoneType: "phoneType",
        additionalPhone: "additionalPhone",
        additionalPhoneType: "additionalPhoneType",
        noPhoneCheckbox: "noPhoneCheckbox",
        additionalPhoneCheckbox: "additionalPhoneCheckbox",
        addressStreet: "addressStreet",
        addressAptOrUnit: "addressAptOrUnit",
        addressCity: "addressCity",
        addressState: "addressState",
        addressZipcode: "addressZipcode",
        mailingAddressCheckbox: "mailingAddressCheckbox",
        mailingAddressStreet: "mailingAddressStreet",
        mailingAddressCity: "mailingAddressCity",
        mailingAddressState: "mailingAddressState",
        mailingAddressZipcode: "mailingAddressZipcode",
        question: "question",
      }}
    />,
    {
      formData,
      renderForm: false,
      stepInfoMap: [
        {
          slug: "contact",
          fieldNames: [
            "phone",
            "phoneType",
            "additionalPhone",
            "additionalPhoneType",
            "noPhoneCheckbox",
            "additionalPhoneCheckbox",
            "addressStreet",
            "addressAptOrUnit",
            "addressCity",
            "addressState",
            "addressZipcode",
            "mailingAddressCheckbox",
            "mailingAddressStreet",
            "mailingAddressCity",
            "mailingAddressState",
            "mailingAddressZipcode",
            "question",
          ],
        },
      ],
    }
  )
  return { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData }
}

describe("ListingApplyContactStepWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocateVerifiedAddress.mockResolvedValue({
      address: {
        street1: "123 Main St",
        street2: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        invalid: false,
      },
    })
  })
  it("displays the error banner for any validation errors", async () => {
    renderListingApplyContactStepWrapper({})
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(screen.getByText(t("error.formSubmission"))).toBeInTheDocument()
    })
  })

  it("updates form data with the verified address", async () => {
    const { mockHandleNextStep, mockSaveFormData } = renderListingApplyContactStepWrapper({
      addressStreet: "123 main street",
      addressAptOrUnit: "apartment four bee",
      addressCity: "the city",
      addressState: "CA",
      addressZipcode: "94105",
      phone: "111-111-1111",
      phoneType: "cell",
      noPhoneCheckbox: false,
      question: "false",
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(mockLocateVerifiedAddress).toHaveBeenCalled()
      expect(mockSaveFormData).toHaveBeenLastCalledWith(
        expect.objectContaining({
          addressStreet: "123 Main St",
          addressAptOrUnit: "Apt 4B",
          addressCity: "San Francisco",
          addressState: "CA",
          addressZipcode: "94105",
          phone: "111-111-1111",
          phoneType: "cell",
          noPhoneCheckbox: false,
          question: "false",
        })
      )
    })
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("displays an inline error for an invalid api response", async () => {
    mockLocateVerifiedAddress.mockRejectedValue({
      response: { status: 422 },
    })
    renderListingApplyContactStepWrapper({
      addressStreet: "123 Main St",
      addressAptOrUnit: "Apt 4B",
      addressCity: "San Francisco",
      addressState: "CA",
      addressZipcode: "94105",
      phone: "111-111-1111",
      phoneType: "cell",
      noPhoneCheckbox: false,
      question: "false",
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(mockLocateVerifiedAddress).toHaveBeenCalled()
      expect(screen.getByText(/this address was not found/i)).toBeInTheDocument()
    })
  })

  it("displays an error for pre-api validation", async () => {
    renderListingApplyContactStepWrapper({
      addressStreet: "Not allowed PO Box",
      addressAptOrUnit: "Apt 4B",
      addressCity: "San Francisco",
      addressState: "CA",
      addressZipcode: "94105",
      phone: "111-111-1111",
      phoneType: "cell",
      noPhoneCheckbox: false,
      question: "false",
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(screen.getByText(t("error.addressValidationPoBox"))).toBeInTheDocument()
    })
  })
})
