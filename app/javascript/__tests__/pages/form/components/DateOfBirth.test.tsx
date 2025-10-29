import React from "react"
import { screen } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import MockDate from "mockdate"
import DateOfBirth from "../../../../pages/form/components/DateOfBirth"
import { formContextWrapper } from "../../../__util__/renderUtils"
import userEvent from "@testing-library/user-event"

const INVALID_DATE_ERROR_MSG = "error.dob"
const INVALID_AGE_ERROR_MSG = "error.dobPrimaryApplicantAge"

const renderDateOfBirth = () => {
  return formContextWrapper(
    <DateOfBirth
      label="label.yourDob"
      ageErrorMessage="error.dobPrimaryApplicantAge"
      fieldNames={{
        birthMonth: "primaryApplicantBirthMonth",
        birthDay: "primaryApplicantBirthDate",
        birthYear: "primaryApplicantBirthYear",
      }}
      minimumAge={18}
    />
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
    renderDateOfBirth()
  })

  it("renders invalid date error for invalid dates", async () => {
    renderDateOfBirth()
    await inputDate("13", "1", "2000")
    expect(screen.queryByText(t(INVALID_DATE_ERROR_MSG))).not.toBeNull()
    expect(screen.queryByText(t(INVALID_AGE_ERROR_MSG))).toBeNull()
  })

  it("renders invalid age error for invalid ages", async () => {
    renderDateOfBirth()
    await inputDate("1", "1", "2010")
    expect(screen.queryByText(t(INVALID_DATE_ERROR_MSG))).toBeNull()
    expect(screen.queryByText(t(INVALID_AGE_ERROR_MSG))).not.toBeNull()
  })
})
