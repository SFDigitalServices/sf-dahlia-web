import { useForm } from "react-hook-form"
import { render } from "@testing-library/react"
import DateOfBirth from "../../../../pages/form/components/DateOfBirth"
import { FormStepProvider } from "../../../../formEngine/formStepContext"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"

const FieldSetWrapper = () => {
  const label = "label.yourDob"
  const minimumAge = 18
  const fieldNames = {
    birthMonth: "primaryApplicantBirthMonth",
    birthDay: "primaryApplicantBirthDate",
    birthYear: "primaryApplicantBirthYear",
  }
  const fieldNameValues = Object.values(fieldNames)

  const { register, watch, trigger, errors } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  })
  const formStepContextValue = { register, errors, watch, trigger }

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
        <DateOfBirth label={label} fieldNames={fieldNames} minimumAge={minimumAge} />
      </FormStepProvider>
    </FormEngineProvider>
  )
}

describe("DateOfBirth", () => {
  it("renders without errors", () => {
    render(<FieldSetWrapper />)
  })
})
