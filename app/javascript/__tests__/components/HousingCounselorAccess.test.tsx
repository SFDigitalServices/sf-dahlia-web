/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"
import HousingCounselorAccess, {
  housingCounselorFieldsetErrors,
} from "../../pages/account/components/HousingCounselorAccess"
import { getErrorMessage } from "../../pages/account/components/util"
import { localizedFormat } from "../../util/languageUtil"

jest.mock("../../util/languageUtil", () => ({
  ...jest.requireActual("../../util/languageUtil"),
  localizedFormat: jest.fn(),
}))
const mockLocalizedFormat = jest.mocked(localizedFormat)

const ShareAccessWrapper = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "onTouched" })
  return (
    /* eslint-disable @typescript-eslint/no-misused-promises */
    <form onSubmit={handleSubmit(jest.fn())}>
      <HousingCounselorAccess register={register} errors={errors} />
      <button type="submit">{t("accountSettings.housingCounselor.shareButton")}</button>
    </form>
  )
}

describe("HousingCounselorAccess", () => {
  beforeEach(() => {
    mockLocalizedFormat.mockReturnValue("January 1, 2020 at 12:00 AM")
  })

  describe("Share HC access", () => {
    it("renders the content to share access with an HC agency", () => {
      render(<ShareAccessWrapper />)

      expect(
        screen.getByRole("group", { name: t("accountSettings.housingCounselor.heading") })
      ).toBeInTheDocument()
      expect(
        screen.getByText(t("accountSettings.housingCounselor.description"))
      ).toBeInTheDocument()
      expect(screen.getByLabelText(t("accountSettings.housingCounselor.label"))).toBeInTheDocument()
      expect(
        screen.getByLabelText(t("accountSettings.housingCounselor.checkbox"))
      ).toBeInTheDocument()
      expect(screen.getByText(t("accountSettings.housingCounselor.p1"))).toBeInTheDocument()
      expect(screen.queryByText(t("accountSettings.housingCounselor.fieldError"))).toBeNull()
      expect(screen.queryByText(t("accountSettings.housingCounselor.checkboxError"))).toBeNull()
    })

    it("renders validation errors when required fields are missing", async () => {
      const user = userEvent.setup()
      render(<ShareAccessWrapper />)

      await user.click(
        screen.getByRole("button", { name: t("accountSettings.housingCounselor.shareButton") })
      )

      expect(screen.getByText(t("accountSettings.housingCounselor.fieldError"))).toBeInTheDocument()
      expect(
        screen.getByText(t("accountSettings.housingCounselor.checkboxError"))
      ).toBeInTheDocument()
    })
  })

  describe("Revoke HC access", () => {
    it("renders the content about the current HC agency with access", () => {
      render(<HousingCounselorAccess register={jest.fn()} housingCounselorAgency="Test Agency A" />)

      expect(
        screen.getByText(
          t("accountSettings.housingCounselor.sharedWith", { agencyName: "Test Agency A" })
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          t("accountSettings.housingCounselor.agencyCan", { agencyName: "Test Agency A" })
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          t("accountSettings.housingCounselor.sharedOn", {
            sharedDate: "January 1, 2020 at 12:00 AM",
          })
        )
      ).toBeInTheDocument()
      expect(mockLocalizedFormat).toHaveBeenCalled()
      expect(screen.queryByLabelText(t("accountSettings.housingCounselor.label"))).toBeNull()
      expect(screen.queryByLabelText(t("accountSettings.housingCounselor.checkbox"))).toBeNull()
    })
  })

  describe("Housing counselor access fieldset errors", () => {
    const testCases = [
      {
        key: "housingCounselorAgency:missing",
        abbreviated: false,
        expected: "accountSettings.housingCounselor.fieldError",
      },
      {
        key: "housingCounselorAgency:missing",
        abbreviated: true,
        expected: "accountSettings.housingCounselor.fieldError",
      },
      {
        key: "housingCounselorAgree:required",
        abbreviated: false,
        expected: "accountSettings.housingCounselor.checkboxError",
      },
      {
        key: "housingCounselorAgree:required",
        abbreviated: true,
        expected: "accountSettings.housingCounselor.banner.shortError",
      },
    ]

    testCases.forEach(({ key, abbreviated, expected }) => {
      it(`returns the correct error message for ${key} with abbreviated=${abbreviated}`, () => {
        expect(getErrorMessage(key, housingCounselorFieldsetErrors, abbreviated)).toBe(t(expected))
      })
    })
  })
})
