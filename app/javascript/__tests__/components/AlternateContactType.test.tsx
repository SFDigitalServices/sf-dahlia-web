import React from "react"
import { useForm } from "react-hook-form"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import AlternateContactType from "../../pages/form/components/AlternateContactType"
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
  const formData = Object.assign(
    {},
    ...Object.values({
      alternateContactType: "alternateContactType",
    }).map((name) => ({ [name]: null }))
  )
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
          alternateContactType: "alternateContactType",
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
        <AlternateContactType
          fieldNames={{
            alternateContactType: "alternateContactType",
          }}
        />
      </FormStepProvider>
    </FormEngineProvider>
  )
}

describe("AlternateContactType", () => {
  it("displays the alternate contact type heading and note", () => {
    render(<FieldSetWrapper />)
    expect(screen.getByText(t("label.alternateContact"))).toBeInTheDocument()
    expect(screen.getByText(t("label.pleaseSelectOne"))).toBeInTheDocument()
  })

  it("displays the other field if the other radio is selected", async () => {
    render(<FieldSetWrapper />)
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: t("label.Other") }))
    expect(screen.getByText(t("label.whatIsYourRelationship"))).toBeInTheDocument()
  })
   it("displays an error message if the field is left empty", async () => {
    render(<FieldSetWrapper />)
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: t("label.Other") }))
    const relationshipInput = screen.getByRole("textbox", { name: t("label.whatIsYourRelationship") })
    await user.click(relationshipInput)
    await user.tab()
    expect(screen.getByText(t("error.relationship"))).toBeInTheDocument()
  })
})
