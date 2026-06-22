import React from "react"
import { screen, fireEvent } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import VerifyAddress from "../../../../pages/form/components/VerifyAddress"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import "@testing-library/jest-dom"

const renderVerifyAddress = (addressData?: {
  street1: string
  street2: string
  city: string
  state: string
  zip: string
}) => {
  const onConfirm = jest.fn()
  const onEdit = jest.fn()
  const { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData } = renderWithFormContextWrapper(
    <VerifyAddress addressData={addressData} onConfirm={onConfirm} onEdit={onEdit} />,
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
  return { mockHandleNextStep, mockHandlePrevStep, mockSaveFormData, onConfirm, onEdit }
}

const controlledAddress = {
  street1: "456 Oak St",
  street2: "",
  city: "Oakland",
  state: "CA",
  zip: "94607",
}

describe("VerifyAddress - primary applicant address", () => {
  it("displays the formatted primary address from formData", () => {
    renderVerifyAddress()
    expect(screen.getByText(/123 Main St Apt 4B/)).toBeInTheDocument()
    expect(screen.getByText(/San Francisco, CA, 94105/)).toBeInTheDocument()
  })

  it("calls handlePrevStep when Edit is clicked", () => {
    const { mockHandlePrevStep } = renderVerifyAddress()
    fireEvent.click(screen.getByRole("button", { name: t("t.edit") }))
    expect(mockHandlePrevStep).toHaveBeenCalled()
  })

  it("calls handleNextStep when Next is clicked", () => {
    const { mockHandleNextStep } = renderVerifyAddress()
    fireEvent.click(screen.getByRole("button", { name: t("t.next") }))
    expect(mockHandleNextStep).toHaveBeenCalled()
  })
})

describe("VerifyAddress - household member address", () => {
  it("displays the passed-in address", () => {
    renderVerifyAddress(controlledAddress)
    expect(screen.getByText(/456 Oak St/)).toBeInTheDocument()
    expect(screen.getByText(/Oakland, CA, 94607/)).toBeInTheDocument()
  })

  it("calls onEdit (not handlePrevStep) when Edit is clicked", () => {
    const { onEdit, mockHandlePrevStep } = renderVerifyAddress(controlledAddress)
    fireEvent.click(screen.getByRole("button", { name: t("t.edit") }))
    expect(onEdit).toHaveBeenCalled()
    expect(mockHandlePrevStep).not.toHaveBeenCalled()
  })

  it("calls onConfirm (not handleNextStep) when Next is clicked", () => {
    const { onConfirm, mockHandleNextStep } = renderVerifyAddress(controlledAddress)
    fireEvent.click(screen.getByRole("button", { name: t("t.next") }))
    expect(onConfirm).toHaveBeenCalled()
    expect(mockHandleNextStep).not.toHaveBeenCalled()
  })
})
