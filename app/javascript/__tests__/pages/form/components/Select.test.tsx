import React from "react"
import { useForm } from "react-hook-form"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import { FormStepProvider } from "../../../../formEngine/formStepContext"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import FormSelect from "../../../../pages/form/components/Select"

const FormSelectWrapper = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, trigger, errors } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  })
  const formStepContextValue = { register, errors, watch, trigger }

  const formEngineContextValue = {
    listing: openRentalListing,
    formData: {},
    saveFormData: jest.fn(),
    dataSources: {
      listing: openRentalListing,
      form: {},
      preferences: {},
    },
    stepInfoMap: [{ slug: "test", fieldNames: [] }],
    sectionNames: [],
    currentStepIndex: 0,
    handleNextStep: jest.fn(),
    handlePrevStep: jest.fn(),
  }

  return (
    <FormEngineProvider value={formEngineContextValue}>
      <FormStepProvider value={formStepContextValue}>
        <FormSelect
          label="label.householdMemberRelationship"
          errorMessage="error.householdMemberRelationship"
          defaultOptionName="label.selectOne"
          options={[
            { name: "label.spouse", value: "spouse" },
            { name: "label.registeredDomesticPartner", value: "Registered Domestic Partner" },
          ]}
          fieldNames={{ selection: "householdMemberRelation" }}
        />
      </FormStepProvider>
    </FormEngineProvider>
  )
}

describe("FormSelect", () => {
  it("displays provided label and placeholder", () => {
    render(<FormSelectWrapper />)
    expect(screen.getByLabelText(t("label.householdMemberRelationship"))).not.toBeNull()
    expect(screen.getByText(t("label.selectOne"))).not.toBeNull()
  })

  it("displays error when no value is selected", async () => {
    render(<FormSelectWrapper />)
    const user = userEvent.setup()
    const select = screen.getByLabelText(t("label.householdMemberRelationship"))
    await user.click(select)
    await user.tab()

    expect(screen.getByText(t("error.householdMemberRelationship"))).not.toBeNull()
  })

  it("selects an option correctly", async () => {
    render(<FormSelectWrapper />)
    const user = userEvent.setup()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const select = screen.getByLabelText(
      t("label.householdMemberRelationship")
    ) as HTMLSelectElement
    await user.selectOptions(select, "spouse")

    expect(select.value).toBe("spouse")
  })
})
