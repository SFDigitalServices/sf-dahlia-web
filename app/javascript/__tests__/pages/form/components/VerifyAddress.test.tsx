import React from "react"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import VerifyAddress from "../../../../pages/form/components/VerifyAddress"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import { locateVerifiedAddress } from "../../../../api/formApiService"
import "@testing-library/jest-dom"

jest.mock("../../../../api/formApiService", () => ({
  locateVerifiedAddress: jest.fn(),
}))

const mockLocateVerifiedAddress = locateVerifiedAddress as jest.Mock

const renderVerifyAddressComponent = (formData: Record<string, unknown> = {}) => {
  const { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData } = renderWithFormContextWrapper(
    <VerifyAddress address="primaryApplicantAddress" />,
    {
      formData,
      renderForm: false,
      stepInfoMap: [{ slug: "verify-address", fieldNames: ["primaryApplicantAddress"] }],
    }
  )
  return { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData }
}

describe("VerifyAddress", () => {
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

  it("displays the verify address page", async () => {
    renderVerifyAddressComponent()
    await waitFor(() => {
      expect(screen.getByText(t("b2aVerifyAddress.title"))).toBeInTheDocument()
    })
  })

  it("displays the formatted address", async () => {
    renderVerifyAddressComponent()
    await waitFor(() => {
      expect(screen.getByText(/123 Main St Apt 4B/)).toBeInTheDocument()
      expect(screen.getByText(/San Francisco, CA, 94105/)).toBeInTheDocument()
    })
  })

  it("displays an error message when radio is not selected", async () => {
    const { mockHandleNextStep, mockSaveFormData } = renderVerifyAddressComponent()
    const user = userEvent.setup()
    await waitFor(() => {
      expect(screen.getByText(/next/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/next/i))
    await waitFor(() => {
      expect(screen.getByText(t("error.confirmedAddress"))).toBeInTheDocument()
    })
    expect(mockHandleNextStep).not.toHaveBeenCalled()
    expect(mockSaveFormData).not.toHaveBeenCalled()
  })

  it("updates form data with the verified address", async () => {
    const { mockHandleNextStep, mockSaveFormData } = renderVerifyAddressComponent({
      primaryApplicantAddressStreet: "123 Main St",
      primaryApplicantAddressAptOrUnit: "Apt 4B",
      primaryApplicantAddressCity: "San Francisco",
      primaryApplicantAddressState: "CA",
      primaryApplicantAddressZipcode: "94105",
    })
    const user = userEvent.setup()
    await waitFor(() => {
      expect(screen.getByRole("radio")).toBeInTheDocument()
    })
    await user.click(screen.getByRole("radio"))
    await user.click(screen.getByRole("button", { name: /next/i }))
    await waitFor(() => {
      expect(mockSaveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryApplicantAddressStreet: "123 Main St",
          primaryApplicantAddressAptOrUnit: "Apt 4B",
          primaryApplicantAddressCity: "San Francisco",
          primaryApplicantAddressState: "CA",
          primaryApplicantAddressZipcode: "94105",
        })
      )
    })
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("shows the loading overlay initially", () => {
    mockLocateVerifiedAddress.mockImplementation(() => new Promise(() => {}))
    renderVerifyAddressComponent()
    expect(screen.getByTestId("loading-overlay")).toBeInTheDocument()
  })
})
