import React from "react"
import { useForm } from "react-hook-form"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import EmailAddress from "../../pages/form/components/EmailAddress"
import { FormStepProvider } from "../../formEngine/formStepContext"
import { FormEngineProvider } from "../../formEngine/formEngineContext"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"

interface FieldSetWrapperProps {
  showDontHaveEmailAddress?: boolean
}

const FieldSetWrapper = ({ showDontHaveEmailAddress = false }: FieldSetWrapperProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, trigger, errors, setValue, clearErrors } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  })
  const formStepContextValue = { register, errors, watch, trigger, setValue, clearErrors }

  const listing = openRentalListing
  const formData = Object.assign({}, ...Object.values({
    email: "primaryApplicantEmail",
    noEmail: "primaryApplicantNoEmail",
  }).map((name) => ({ [name]: null })))
  const formEngineContextValue = {
    listing,
    formData,
    saveFormData: jest.fn(),
    dataSources: {
      listing,
      form: formData,
      preferences: {},
    },
    stepInfoMap: [{ slug: "test", fieldNames: Object.values({
      email: "primaryApplicantEmail",
      noEmail: "primaryApplicantNoEmail",
    }) }],
    sectionNames: [],
    currentStepIndex: 0,
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
  }

  return (
    <FormEngineProvider value={formEngineContextValue}>
      <FormStepProvider value={formStepContextValue}>
        <EmailAddress
                  fieldNames={{
          email: "primaryApplicantEmail",
          noEmail: "primaryApplicantNoEmail",
        }}
        label="label.applicantEmail"
        note="b2Contact.onlyUseYourEmail"
        showDontHaveEmailAddress={showDontHaveEmailAddress}
        />
      </FormStepProvider>
    </FormEngineProvider>
  )
}

describe("EmailAddress", () => {
   it("displays the provided label and note for the email address", () => {
    render(<FieldSetWrapper />)
    expect(screen.getByText(t("label.applicantEmail"))).toBeInTheDocument()
    expect(screen.getByText(t("b2Contact.onlyUseYourEmail"))).toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("displays a conditional checkbox for no email address", () => {
    render(<FieldSetWrapper showDontHaveEmailAddress={true} />)
    expect(screen.getByRole("checkbox", { name: t("label.applicantNoEmail") })).toBeInTheDocument()
  })

  it("displays an error message if validation fails", async () => {
    render(<FieldSetWrapper />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(t("label.applicantEmail")), "invalid-email")
    await user.tab()
    expect(screen.getByText(t("error.email"))).toBeInTheDocument()
  })

  it("disables the field if the checkbox is selected", async () => {
    render(<FieldSetWrapper showDontHaveEmailAddress />)
    const user = userEvent.setup()
    const emailInput = screen.getByLabelText(t("label.applicantEmail"))
    expect(emailInput.disabled).toBe(false)
    await user.click(screen.getByRole("checkbox", { name: t("label.applicantNoEmail") }))
    expect(emailInput.disabled).toBe(true)
  })
})
