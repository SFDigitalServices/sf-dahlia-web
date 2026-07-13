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

const createNewHouseholdMember = async (
  user: ReturnType<typeof userEvent.setup>,
  {
    firstName = "John",
    lastName = "Smith",
    birthMonth = "12",
    birthDay = "12",
    birthYear = "1990",
    sameAddress = true,
    street = "123 Main St",
    city = "San Francisco",
    zip = "94105",
    workInSf = true,
    relation = "Spouse",
  }: Partial<{
    firstName: string
    lastName: string
    birthMonth: string
    birthDay: string
    birthYear: string
    sameAddress: boolean
    street: string
    city: string
    zip: string
    workInSf: boolean
    relation: string
  }> = {}
) => {
  await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))

  await user.type(screen.getByLabelText(/first name/i), firstName)
  await user.type(screen.getByLabelText(/last name/i), lastName)
  await user.type(screen.getByLabelText("Month"), birthMonth)
  await user.type(screen.getByLabelText("Day"), birthDay)
  await user.type(screen.getByLabelText("Year"), birthYear)

  await user.click(screen.getAllByLabelText(sameAddress ? t("t.yes") : t("t.no"))[0])
  await user.click(screen.getAllByLabelText(workInSf ? t("t.yes") : t("t.no"))[1])

  if (!sameAddress) {
    await user.type(screen.getByLabelText(/street/i), street)
    await user.type(screen.getByLabelText(/city/i), city)
    await user.type(screen.getByLabelText(/zip/i), zip)
  }

  await user.selectOptions(screen.getByLabelText(t("label.householdMemberRelationship")), relation)
  await user.click(screen.getByRole("button", { name: t("label.householdMemberSave") }))
}

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
      <HouseholdMemberMultiStepWrapper
        fieldNames={{
          householdMembers: "householdMembers",
          showLiveWorkInSfPrefStep: "showLiveWorkInSfPrefStep",
        }}
      />,
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

  it("navigates to the household member form when add is clicked", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    expect(screen.getByText(t("c3HouseholdMemberForm.title"))).toBeInTheDocument()
  })

  it("saves a new household member", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()
    await createNewHouseholdMember(user, { firstName: "John", lastName: "Doe" })
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

    expect(mockSaveFormData).toHaveBeenCalledWith({ ...formData, householdMembers: members })
    expect(mockHandleNextStep).toHaveBeenCalledWith({ ...formData, householdMembers: members })
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

  it("does not verify the address when the member shares the applicant's address", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await createNewHouseholdMember(user, { firstName: "John", lastName: "Smith" })

    expect(locateVerifiedAddress).not.toHaveBeenCalled()
    expect(screen.getByText("John Smith")).toBeInTheDocument()
  })

  it("shows the address verification screen when validation succeeds", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await createNewHouseholdMember(user, { sameAddress: false })

    await waitFor(() => expect(mockLocateVerifiedAddress).toHaveBeenCalled())
    expect(screen.getByText(t("b2aVerifyAddress.title"))).toBeInTheDocument()
  })

  it("saves the household member after address confirmation", async () => {
    const { mockSaveFormData } = renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await createNewHouseholdMember(user, { sameAddress: false, relation: "Parent" })

    await waitFor(() => expect(mockLocateVerifiedAddress).toHaveBeenCalled())
    expect(screen.getByText(t("b2aVerifyAddress.title"))).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: t("t.next") }))
    expect(mockSaveFormData).toHaveBeenCalled()
    expect(screen.getByText("John Smith")).toBeInTheDocument()
  })

  it("returns to the household member form when edit is clicked on the verify screen", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await createNewHouseholdMember(user, { sameAddress: false })

    await waitFor(() => expect(mockLocateVerifiedAddress).toHaveBeenCalled())
    expect(screen.getByText(t("b2aVerifyAddress.title"))).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: t("t.edit") }))

    expect(screen.getByText(t("c3HouseholdMemberForm.title"))).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toHaveValue("John")
  })

  it("shows the address not found error when validation returns 422", async () => {
    mockLocateVerifiedAddress.mockRejectedValue({ response: { status: 422 } })

    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await createNewHouseholdMember(user, { sameAddress: false })

    await waitFor(() => expect(mockLocateVerifiedAddress).toHaveBeenCalled())
    expect(await screen.findByText(/this address was not found/i)).toBeInTheDocument()
  })

  it("shows an error when validation fails with a non-422 error", async () => {
    mockLocateVerifiedAddress.mockRejectedValue({ response: { status: 500 } })

    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()

    await createNewHouseholdMember(user, { sameAddress: false })

    await waitFor(() => expect(mockLocateVerifiedAddress).toHaveBeenCalled())
    expect(await screen.findByText(/looks like something went wrong/i)).toBeInTheDocument()
  })
})
