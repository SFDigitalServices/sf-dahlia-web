import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import ListingApplyHouseholdIntro from "../../../../pages/form/components/household/ListingApplyHouseholdIntro"
import userEvent from "@testing-library/user-event"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("ListingApplyHouseholdIntro", () => {
  let mockHandleNextStep: jest.Mock

  beforeEach(() => {
    ;({ mockHandleNextStep } = renderWithFormContextWrapper(<ListingApplyHouseholdIntro />, {
      renderForm: false,
    }))
  })

  const user = userEvent.setup()

  it("renders the component", () => {
    expect(screen.getByText(t("c1HouseholdIntro.title"))).not.toBeNull()
  })

  it("skips to the next section if alone", async () => {
    await user.click(screen.getByText(t("label.liveAlone")))
    expect(mockHandleNextStep).toHaveBeenCalledWith({
      liveAlone: "true",
      householdMembers: null,
    })
  })

  it("goes to the next page if there are household members", async () => {
    await user.click(screen.getByText(t("label.otherPeople")))
    expect(mockHandleNextStep).toHaveBeenCalledWith({ liveAlone: "false" })
  })
})
