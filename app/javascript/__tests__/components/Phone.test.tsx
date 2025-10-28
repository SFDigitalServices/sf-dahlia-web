import React from "react"
import { useForm } from "react-hook-form"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import Phone from "../../pages/form/components/Phone"
import { FormStepProvider } from "../../formEngine/formStepContext"
import { FormEngineProvider } from "../../formEngine/formEngineContext"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"

const FieldSetWrapper = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, trigger, errors, setValue, clearErrors } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  })
  const formStepContextValue = { register, errors, watch, trigger, setValue, clearErrors }

  const listing = openRentalListing
  const formData = {}
  const formEngineContextValue = {
    listing,
    formData,
    saveFormData: jest.fn(),
    dataSources: {
      listing,
      form: formData,
      preferences: {},
    },
    stepInfoMap: [
      {
        slug: "test",
        fieldNames: Object.values({
          phone: "primaryApplicantPhone",
          phoneType: "primaryApplicantPhoneType",
          additionalPhone: "primaryApplicantAdditionalPhone",
          additionalPhoneType: "primaryApplicantAdditionalPhoneType",
        }),
      },
    ],
    sectionNames: [],
    currentStepIndex: 0,
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
  }

  return (
    <FormEngineProvider value={formEngineContextValue}>
      <FormStepProvider value={formStepContextValue}>
        <Phone
          label="label.applicantPhone"
          showTypeOfNumber
          showDontHavePhoneNumber
          showAdditionalPhoneNumber
          labelForAdditionalPhoneNumber="label.applicantSecondPhone"
          fieldNames={{
            phone: "primaryApplicantPhone",
            phoneType: "primaryApplicantPhoneType",
            additionalPhone: "primaryApplicantAdditionalPhone",
            additionalPhoneType: "primaryApplicantAdditionalPhoneType",
          }}
        />
      </FormStepProvider>
    </FormEngineProvider>
  )
}

describe("Phone", () => {
  it("displays the two field inputs and two checkboxes", () => {
    render(<FieldSetWrapper />)
    expect(screen.getByText(t("label.applicantPhone"))).toBeInTheDocument()
    expect(screen.getByText(t("label.whatTypeOfNumber"))).toBeInTheDocument()
    expect(screen.getByText(t("label.applicantNoPhone"))).toBeInTheDocument()
    expect(screen.getByText(t("label.applicantAdditionalPhone"))).toBeInTheDocument()
  })

  it("disables the inputs if the no phone checkbox is checked", async () => {
    render(<FieldSetWrapper />)
    const noPhoneCheckbox = screen.getByRole("checkbox", { name: t("label.applicantNoPhone") })
    const user = userEvent.setup()
    await user.click(noPhoneCheckbox)
    expect(screen.getByRole("textbox", { name: t("label.applicantPhone") })).toBeDisabled()
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("displays the additional input if the additional phone checkbox is checked", async () => {
    render(<FieldSetWrapper />)
    const additionalPhoneCheckbox = screen.getByRole("checkbox", {
      name: t("label.applicantAdditionalPhone"),
    })
    const user = userEvent.setup()
    await user.click(additionalPhoneCheckbox)
    expect(
      screen.getByRole("textbox", { name: t("label.applicantSecondPhone") })
    ).toBeInTheDocument()
  })

  it("disables the no phone checkbox if the additional phone checkbox is checked", async () => {
    render(<FieldSetWrapper />)
    const additionalPhoneCheckbox = screen.getByRole("checkbox", {
      name: t("label.applicantAdditionalPhone"),
    })
    const user = userEvent.setup()
    await user.click(additionalPhoneCheckbox)
    expect(screen.getByRole("checkbox", { name: t("label.applicantNoPhone") })).toBeDisabled()
  })
})
