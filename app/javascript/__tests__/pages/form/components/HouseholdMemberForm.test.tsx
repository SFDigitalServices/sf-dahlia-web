import React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event" // default import
import { useForm, FormProvider } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"
import HouseholdMemberForm from "../../../../pages/form/components/household/HouseholdMemberForm"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

const HouseholdMemberFormWrapper = ({
  handleUpdateHouseholdMember = jest.fn(),
  handleDeleteHouseholdMember = jest.fn(),
  isEditing = false,
}: {
  handleUpdateHouseholdMember?: jest.Mock
  handleDeleteHouseholdMember?: jest.Mock
  isEditing?: boolean
}) => {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <HouseholdMemberForm
        handleUpdateHouseholdMember={handleUpdateHouseholdMember}
        handleDeleteHouseholdMember={handleDeleteHouseholdMember}
        isEditing={isEditing}
        methods={methods}
      />
    </FormProvider>
  )
}

const renderHouseholdMemberForm = (props = {}) => {
  renderWithFormContextWrapper(<HouseholdMemberFormWrapper {...props} />)
}

describe("HouseholdMemberForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows the save button when not editing", () => {
    renderHouseholdMemberForm()
    expect(screen.getByRole("button", { name: t("label.householdMemberSave") })).toBeInTheDocument()
  })

  it("shows the update button when editing", () => {
    renderHouseholdMemberForm({ isEditing: true })
    expect(
      screen.getByRole("button", { name: t("label.householdMemberUpdate") })
    ).toBeInTheDocument()
  })

  it("does not show the delete button when not editing", () => {
    renderHouseholdMemberForm()
    expect(screen.queryByText(t("label.householdMemberDelete"))).not.toBeInTheDocument()
  })

  it("shows the delete button when editing", () => {
    renderHouseholdMemberForm({ isEditing: true })
    expect(screen.getByText(t("label.householdMemberDelete"))).toBeInTheDocument()
  })

  it("calls handleDeleteHouseholdMember when delete is clicked", async () => {
    const handleDeleteHouseholdMember = jest.fn()
    renderHouseholdMemberForm({ isEditing: true, handleDeleteHouseholdMember })
    const user = userEvent.setup()
    await user.click(screen.getByText(t("label.householdMemberDelete")))
    expect(handleDeleteHouseholdMember).toHaveBeenCalledTimes(1)
  })
})
