import React from "react"
import { useForm } from "react-hook-form"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import MockDate from "mockdate"
import DateOfBirth from "../../../../pages/form/components/DateOfBirth"
import { FormStepProvider } from "../../../../formEngine/formStepContext"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"

const INVALID_DATE_ERROR_MSG = "error.dob"
const INVALID_AGE_ERROR_MSG = "error.dobPrimaryApplicantAge"

const FieldSetWrapper = () => {
  const label = "label.yourDob"
  const minimumAge = 18
  const fieldNames = {
    birthMonth: "primaryApplicantBirthMonth",
    birthDay: "primaryApplicantBirthDate",
    birthYear: "primaryApplicantBirthYear",
  }
  const fieldNameValues = Object.values(fieldNames)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, trigger, errors, control, setValue, clearErrors } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  })
  const formStepContextValue = { register, errors, watch, trigger, control, setValue, clearErrors }

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
        <DateOfBirth
          label={label}
          ageErrorMessage="error.dobPrimaryApplicantAge"
          fieldNames={fieldNames}
          minimumAge={minimumAge}
        />
      </FormStepProvider>
    </FormEngineProvider>
  )
}

const inputDate = async (month: string, day: string, year: string) => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Month"), month)
  await user.type(screen.getByLabelText("Day"), day)
  await user.type(screen.getByLabelText("Year"), year)
  await user.tab()
}

describe("DateOfBirth", () => {
  beforeEach(() => {
    MockDate.set("2020-01-01")
  })

  it("renders without errors", () => {
    render(<FieldSetWrapper />)
  })

  it("renders invalid date error for invalid dates", async () => {
    render(<FieldSetWrapper />)
    await inputDate("13", "1", "2000")

    expect(screen.queryByText(t(INVALID_DATE_ERROR_MSG))).not.toBeNull()
    expect(screen.queryByText(t(INVALID_AGE_ERROR_MSG))).toBeNull()
  })

  it("renders invalid age error for invalid ages", async () => {
    render(<FieldSetWrapper />)
    await inputDate("1", "1", "2010")

    expect(screen.queryByText(t(INVALID_DATE_ERROR_MSG))).toBeNull()
    expect(screen.queryByText(t(INVALID_AGE_ERROR_MSG))).not.toBeNull()
  })
})
