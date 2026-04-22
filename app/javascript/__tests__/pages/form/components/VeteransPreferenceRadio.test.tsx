import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import VeteransPreferenceRadio from "../../../../pages/form/components/VeteransPreferenceRadio"

const adultMember = {
  id: "jane--doe-1990-1-15",
  firstName: "Jane",
  middleName: "",
  lastName: "Doe",
  birthYear: "1990",
  birthMonth: "1",
  birthDay: "15",
}

const childMember = {
  id: "kid-smith-doe-2020-6-1",
  firstName: "Kid",
  middleName: "Smith",
  lastName: "Doe",
  birthYear: "2020",
  birthMonth: "6",
  birthDay: "1",
}

const formData = {
  primaryApplicantFirstName: "John",
  primaryApplicantMiddleName: "",
  primaryApplicantLastName: "Smith",
  primaryApplicantBirthYear: "1985",
  primaryApplicantBirthMonth: "3",
  primaryApplicantBirthDate: "10",
  householdMembers: [adultMember, childMember],
}

const fieldNames = {
  isAnyoneAVeteran: "_isAnyoneAVeteran",
  veteranMemberId: "_veteranMemberId",
}

const renderComponent = () => {
  renderWithFormContextWrapper(<VeteransPreferenceRadio fieldNames={fieldNames} />, { formData })
}

describe("VeteransPreferenceRadio", () => {
  it("renders yes, no, and prefer not to answer radio options", () => {
    renderComponent()

    expect(screen.getByLabelText(t("t.yes"))).toBeInTheDocument()
    expect(screen.getByLabelText(t("t.no"))).toBeInTheDocument()
    expect(screen.getByLabelText(t("t.preferNotToAnswer"))).toBeInTheDocument()
  })

  it("shows the veteran select dropdown when yes is selected", async () => {
    renderComponent()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("t.yes")))

    expect(screen.getByText(t("e7aVeteransPreference.whoIsAVeteran"))).toBeInTheDocument()
  })

  it("only shows household members of valid veteran age in the dropdown", async () => {
    renderComponent()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("t.yes")))

    expect(screen.getByText("John Smith")).toBeInTheDocument()
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    expect(screen.queryByText("Kid Smith Doe")).not.toBeInTheDocument()
  })

  it("shows the info message when 'prefer not to answer' is selected", async () => {
    renderComponent()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("t.preferNotToAnswer")))

    expect(
      screen.getByText(t("e7aVeteransPreference.yourAnswerCouldAffectLotteryRanking"))
    ).toBeInTheDocument()
    expect(
      screen.getByText(t("e7aVeteransPreference.ifSomeoneOnTheApplicationIsAVeteran"))
    ).toBeInTheDocument()
  })

  it("hides the info message when switching from 'prefer not to answer' to 'no'", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(t("t.preferNotToAnswer")))
    expect(
      screen.getByText(t("e7aVeteransPreference.yourAnswerCouldAffectLotteryRanking"))
    ).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("t.no")))
    expect(
      screen.queryByText(t("e7aVeteransPreference.yourAnswerCouldAffectLotteryRanking"))
    ).not.toBeInTheDocument()
  })

  it("hides the veteran select dropdown when switching from yes to no", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(t("t.yes")))
    expect(screen.getByText(t("e7aVeteransPreference.whoIsAVeteran"))).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("t.no")))
    expect(screen.queryByText(t("e7aVeteransPreference.whoIsAVeteran"))).not.toBeInTheDocument()
  })

  it("displays an error when submitting without selecting an option", async () => {
    renderComponent()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "next" }))

    expect(screen.queryByText(t("error.pleaseSelectAnOption"))).toBeInTheDocument()
  })
})
