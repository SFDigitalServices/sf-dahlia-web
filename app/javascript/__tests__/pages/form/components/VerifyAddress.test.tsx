import React from "react"
import { screen, waitFor } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import VerifyAddress from "../../../../pages/form/components/VerifyAddress"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import "@testing-library/jest-dom"

const renderVerifyAddressComponent = () => {
  const { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData } = renderWithFormContextWrapper(
    <VerifyAddress />,
    {
      formData: {
        primaryApplicantAddressStreet: "123 Main St",
        primaryApplicantAddressAptOrUnit: "Apt 4B",
        primaryApplicantAddressCity: "San Francisco",
        primaryApplicantAddressState: "CA",
        primaryApplicantAddressZipcode: "94105",
      },
      renderForm: false,
      stepInfoMap: [{ slug: "verify-address" }],
    }
  )
  return { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData }
}

describe("VerifyAddress", () => {
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
})
