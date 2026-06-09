import React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import HouseholdMemberMultiStepWrapper from "../../../../pages/form/components/household/HouseholdMemberMultiStepWrapper"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import { locateVerifiedAddress } from "../../../../api/formApiService"

jest.mock("../../../../api/formApiService", () => ({
  locateVerifiedAddress: jest.fn(),
}))

const mockLocateVerifiedAddress = locateVerifiedAddress as jest.Mock

describe("HouseholdMemberMultiStepWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocateVerifiedAddress.mockResolvedValue({
      address: {
        street1: "123 Main St",
        street2: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
      },
    })
  })

  const renderHouseholdMemberMultiStepWrapper = (formData = {}) => {
    return renderWithFormContextWrapper(
      <HouseholdMemberMultiStepWrapper fieldNames={{ householdMembers: "householdMembers" }} />,
      {
        stepInfoMap: [{ slug: "household-member-form", fieldNames: [] }],
        formData,
      }
    )
  }

  it("renders the add household members page by default", () => {
    renderHouseholdMemberMultiStepWrapper()
    expect(screen.getByText(t("c2HouseholdMembers.title"))).toBeInTheDocument()
  })

  it("shows the add household member button", () => {
    renderHouseholdMemberMultiStepWrapper()
    expect(screen.getByText("+ " + t("label.addHouseholdMember"))).toBeInTheDocument()
  })

  it("navigates to the household member form when add is clicked and saves a new member", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    expect(screen.getByText(t("c3HouseholdMemberForm.title"))).toBeInTheDocument()

    await user.type(screen.getByLabelText(/first name/i), "John")
    await user.type(screen.getByLabelText(/last name/i), "Doe")
    await user.type(screen.getByLabelText("Month"), "6")
    await user.type(screen.getByLabelText("Day"), "15")
    await user.type(screen.getByLabelText("Year"), "1985")
    const yesButtons = screen.getAllByLabelText(t("t.yes"))
    await user.click(yesButtons[0])
    await user.click(yesButtons[1])
    await user.selectOptions(
      screen.getByLabelText(t("label.householdMemberRelationship")),
      "Spouse"
    )

    await user.click(screen.getByRole("button", { name: t("label.householdMemberSave") }))
    expect(screen.getByText("John Doe")).toBeInTheDocument()
  })

  it("renders existing household members from formData", () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [{ firstName: "John", lastName: "Doe" }],
    })
    expect(screen.getByText("John Doe")).toBeInTheDocument()
  })

  it("navigates to the form in edit mode when a household member's edit button is clicked", async () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [{ firstName: "John", lastName: "Doe" }],
    })
    const user = userEvent.setup()
    const editButtons = screen.getAllByRole("button", { name: t("t.edit") })
    await user.click(editButtons[1])
    expect(
      screen.getByRole("button", { name: t("label.householdMemberUpdate") })
    ).toBeInTheDocument()
  })

  it("removes a member and returns to the list when delete is clicked", async () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [{ firstName: "John", lastName: "Doe" }],
    })
    const user = userEvent.setup()
    const editButtons = screen.getAllByRole("button", { name: t("t.edit") })
    await user.click(editButtons[1])
    await user.click(screen.getByText(t("label.householdMemberDelete")))
    expect(screen.getByText(t("c2HouseholdMembers.title"))).toBeInTheDocument()
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
  })

  it("resets editing state after new member is added", async () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [
        {
          firstName: "John",
          lastName: "Smith",
          birthMonth: "12",
          birthDay: "12",
          birthYear: "1990",
          hasSameAddressAsApplicant: "true",
          workInSf: "true",
          relation: "Spouse",
        },
      ],
    })
    const user = userEvent.setup()

    const editButtons = screen.getAllByRole("button", { name: t("t.edit") })
    await user.click(editButtons[1])

    await user.click(screen.getByRole("button", { name: t("label.householdMemberUpdate") }))
    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    expect(screen.queryByText(t("label.householdMemberDelete"))).not.toBeInTheDocument()
  })

  it("saves household members and advances to next step when done adding people is clicked", async () => {
    const members = [
      { firstName: "John", lastName: "Doe" },
      { firstName: "Jane", lastName: "Doe" },
    ]
    const formData = { householdMembers: members, otherField: "value" }
    const { mockSaveFormData, mockHandleNextStep } = renderHouseholdMemberMultiStepWrapper(formData)
    const user = userEvent.setup()

    await user.click(screen.getByText(t("label.doneAddingPeople")))

    expect(mockSaveFormData).toHaveBeenCalledWith({
      ...formData,
      householdMembers: members,
    })
    expect(mockHandleNextStep).toHaveBeenCalledWith({
      ...formData,
      householdMembers: members,
    })
  })

  it("saves empty household members array when done adding people is clicked with no members", async () => {
    const { mockSaveFormData, mockHandleNextStep } = renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("label.doneAddingPeople")))

    expect(mockSaveFormData).toHaveBeenCalledWith({ householdMembers: [] })
    expect(mockHandleNextStep).toHaveBeenCalledWith({ householdMembers: [] })
  })

  it("returns to the add household members page when cancel is clicked while adding a new member", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    expect(screen.getByText(t("c3HouseholdMemberForm.title"))).toBeInTheDocument()

    await user.click(screen.getByText(t("label.householdMemberCancel")))
    expect(screen.getByText(t("c2HouseholdMembers.title"))).toBeInTheDocument()
  })

  it("does not check address verification when household member shares applicant address", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    await user.type(screen.getByLabelText(/first name/i), "John")
    await user.type(screen.getByLabelText(/last name/i), "Doe")
    const yesButtons = screen.getAllByLabelText(t("t.yes"))
    await user.click(yesButtons[0])

    await user.click(
      screen.getByRole("button", {
        name: t("label.householdMemberSave"),
      })
    )
    expect(locateVerifiedAddress).not.toHaveBeenCalled()
  })

  it("shows address verification screen when address validation succeeds", async () => {
    renderHouseholdMemberMultiStepWrapper()

    const user = userEvent.setup()
    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    await user.type(screen.getByLabelText(/first name/i), "John")
    await user.type(screen.getByLabelText(/last name/i), "Smith")
    await user.type(screen.getByLabelText("Month"), "12")
    await user.type(screen.getByLabelText("Day"), "12")
    await user.type(screen.getByLabelText("Year"), "1990")

    const noButtons = screen.getAllByLabelText(t("t.no"))
    await user.click(noButtons[0])

    const yesButtons = screen.getAllByLabelText(t("t.yes"))
    await user.click(yesButtons[1])

    await user.type(screen.getByLabelText(/street/i), "123 Main St")
    await user.type(screen.getByLabelText(/city/i), "San Francisco")
    await user.type(screen.getByLabelText(/zip/i), "94105")

    await user.selectOptions(
      screen.getByLabelText(t("label.householdMemberRelationship")),
      "Spouse"
    )
    await user.click(
      screen.getByRole("button", {
        name: t("label.householdMemberSave"),
      })
    )
    await waitFor(() => {
      expect(mockLocateVerifiedAddress).toHaveBeenCalled()
    })
    expect(screen.getByText(t("b2aVerifyAddress.title"))).toBeInTheDocument()
  })
  it("saves household member after address confirmation", async () => {
    const { mockSaveFormData } = renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))

    await user.type(screen.getByLabelText(/first name/i), "John")
    await user.type(screen.getByLabelText(/last name/i), "Smith")
    await user.type(screen.getByLabelText("Month"), "12")
    await user.type(screen.getByLabelText("Day"), "12")
    await user.type(screen.getByLabelText("Year"), "1990")

    const noButtons = screen.getAllByLabelText(t("t.no"))
    await user.click(noButtons[0])
    await user.click(noButtons[1])

    await user.type(screen.getByLabelText(/street/i), "123 Main St")
    await user.type(screen.getByLabelText(/city/i), "San Francisco")
    await user.type(screen.getByLabelText(/zip/i), "94105")

    await user.selectOptions(
      screen.getByLabelText(t("label.householdMemberRelationship")),
      "Parent"
    )

    await user.click(
      screen.getByRole("button", {
        name: t("label.householdMemberSave"),
      })
    )

    await waitFor(() => {
      expect(mockLocateVerifiedAddress).toHaveBeenCalled()
    })

    expect(screen.getByText(t("b2aVerifyAddress.title"))).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", {
        name: t("t.next"),
      })
    )
    expect(mockSaveFormData).toHaveBeenCalled()
    expect(screen.getByText("John Smith")).toBeInTheDocument()
  })
})
