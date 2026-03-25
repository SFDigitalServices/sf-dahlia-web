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
  handleCancelAddHouseholdMember = jest.fn(),
  isEditing = false,
}: {
  handleUpdateHouseholdMember?: jest.Mock
  handleDeleteHouseholdMember?: jest.Mock
  handleCancelAddHouseholdMember?: jest.Mock
  isEditing?: boolean
}) => {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <HouseholdMemberForm
        handleUpdateHouseholdMember={handleUpdateHouseholdMember}
        handleDeleteHouseholdMember={handleDeleteHouseholdMember}
        handleCancelAddHouseholdMember={handleCancelAddHouseholdMember}
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
  it("clicking save button with populated fields triggers form submission", async () => {
    const handleUpdateHouseholdMember = jest.fn()
    renderHouseholdMemberForm({ handleUpdateHouseholdMember })
    const user = userEvent.setup()
    const yesButtons = screen.getAllByLabelText(t("t.yes"))

    await user.type(screen.getByLabelText(/first name/i), "John")
    await user.type(screen.getByLabelText(/last name/i), "Smith")
    await user.type(screen.getByLabelText("Month"), "12")
    await user.type(screen.getByLabelText("Day"), "12")
    await user.type(screen.getByLabelText("Year"), "1990")
    await user.click(yesButtons[0])
    await user.click(yesButtons[1])
    await user.selectOptions(
      screen.getByLabelText(t("label.householdMemberRelationship")),
      "spouse"
    )

    await user.click(screen.getByRole("button", { name: t("label.householdMemberSave") }))
    expect(handleUpdateHouseholdMember).toHaveBeenCalledTimes(1)
  })
})
