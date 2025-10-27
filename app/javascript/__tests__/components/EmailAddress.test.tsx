import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import EmailAddress from "../../pages/form/components/EmailAddress"
import { useFormStepContext } from "../../formEngine/formStepContext"

jest.mock("../../formEngine/formStepContext")
const mockRegister = jest.fn()
const mockSetValue = jest.fn()
const mockClearErrors = jest.fn()

const mockUseFormStepContext = useFormStepContext as jest.MockedFunction<typeof useFormStepContext>

describe("EmailAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFormStepContext.mockReturnValue({
      register: mockRegister,
      errors: {},
      setValue: mockSetValue,
      clearErrors: mockClearErrors,
      watch: jest.fn(),
      trigger: jest.fn(),
    })
  })

  it("displays the provided label and note for the email address", () => {
    render(
      <EmailAddress
        fieldNames={{
          email: "primaryApplicantEmail",
          noEmail: "primaryApplicantNoEmail",
        }}
        label="label.applicantEmail"
        note="b2Contact.onlyUseYourEmail"
        showDontHaveEmailAddress={false}
      />
    )
    expect(screen.getByText(t("label.applicantEmail"))).toBeInTheDocument()
    expect(screen.getByText(t("b2Contact.onlyUseYourEmail"))).toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("displays a conditional checkbox for no email address", () => {
    render(
      <EmailAddress
        fieldNames={{
          email: "primaryApplicantEmail",
          noEmail: "primaryApplicantNoEmail",
        }}
        label="label.applicantEmail"
        note="b2Contact.onlyUseYourEmail"
        showDontHaveEmailAddress={true}
      />
    )
    expect(screen.getByRole("checkbox", { name: t("label.applicantNoEmail") })).toBeInTheDocument()
  })
})
