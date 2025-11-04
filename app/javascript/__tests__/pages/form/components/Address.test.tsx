import React from "react"
import { useForm } from "react-hook-form"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import Address from "../../../../pages/form/components/Address"
import { FormStepProvider } from "../../../../formEngine/formStepContext"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"

const FieldSetWrapper = () => {
  const fieldNames = {
    addressStreet: "primaryApplicantAddressStreet",
    addressAptOrUnit: "primaryApplicantAddressAptOrUnit",
    addressCity: "primaryApplicantAddressCity",
    addressState: "primaryApplicantAddressState",
    addressZipcode: "primaryApplicantAddressZipcode",
    mailingAddressStreet: "primaryApplicantMailingAddressStreet",
    mailingAddressCity: "primaryApplicantMailingAddressCity",
    mailingAddressState: "primaryApplicantMailingAddressState",
    mailingAddressZipcode: "primaryApplicantMailingAddressZipcode",
  }
  const fieldNameValues = Object.values(fieldNames)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, trigger, errors, control, clearErrors, setValue } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  })
  const formStepContextValue = { register, errors, watch, trigger, control, clearErrors, setValue }

  const listing = openRentalListing
  const formData = Object.assign({}, ...fieldNameValues.map((name) => ({ [name]: null })))
  const formEngineContextValue = {
    listing,
    formData,
    saveFormData: jest.fn(),
    dataSources: {
      listing,
      form: formData,
      preferences: {},
    },
    stepInfoMap: [{ slug: "test", fieldNames: fieldNameValues }],
    sectionNames: [],
    currentStepIndex: 0,
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
  }

  return (
    <FormEngineProvider value={formEngineContextValue}>
      <FormStepProvider value={formStepContextValue}>
        <Address
          showAptOrUnit={true}
          requireAddress={true}
          label="label.address"
          note="b2Contact.applicantAddressDesc"
          showMailingAddress={true}
          fieldNames={fieldNames}
        />
      </FormStepProvider>
    </FormEngineProvider>
  )
}

describe("Address", () => {
  it("renders the address input labels", () => {
    render(<FieldSetWrapper />)
    expect(screen.getByText(t("label.address1"))).toBeInTheDocument()
    expect(screen.getByText(t("label.address2"))).toBeInTheDocument()
    expect(screen.getByText(t("label.city"))).toBeInTheDocument()
    expect(screen.getByText(t("label.state"))).toBeInTheDocument()
    expect(screen.getByText(t("label.zip"))).toBeInTheDocument()
  })

  it("renders the mailing address checkbox", () => {
    render(<FieldSetWrapper />)
    expect(screen.getByText(t("label.applicantSeparateAddress"))).toBeInTheDocument()
  })

  it("renders the mailing address inputs if the checkbox is checked", async () => {
    render(<FieldSetWrapper />)
    const checkbox = screen.getByText(t("label.applicantSeparateAddress"))
    const user = userEvent.setup()
    await user.click(checkbox)
    expect(screen.getByText(t("b2Contact.provideAnAddress"))).toBeInTheDocument()
  })

  it("displays an error message if a required field is empty", async () => {
    render(<FieldSetWrapper />)
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("label.address1")))
    await user.tab()
    expect(screen.getByText(t("error.address"))).toBeInTheDocument()
  })
})
