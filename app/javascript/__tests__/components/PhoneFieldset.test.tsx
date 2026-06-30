import React from "react"
import PhoneFieldset, {
  handlePhoneServerErrors,
  phoneFieldsetErrors,
} from "../../pages/account/components/PhoneFieldset"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { FormProvider, useForm } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"
import { ExpandedAccountAxiosError, getErrorMessage } from "../../pages/account/components/util"

const defaultValues = {
  phone: "",
  phoneType: "",
  noPhone: false,
  secondPhoneCheckbox: false,
  secondPhone: "",
  secondPhoneType: "",
}

const FieldsetWrapper = () => {
  const formMethods = useForm({
    mode: "all",
    defaultValues,
  })

  return (
    <FormProvider {...formMethods}>
      <PhoneFieldset />
    </FormProvider>
  )
}

describe("PhoneFieldset", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
  })

  it("renders without validation errors", () => {
    render(<FieldsetWrapper />)
    expect(screen.queryByText(t("accountLayout.contact.errorMissing"))).toBeNull()
    expect(screen.queryByText(t("accountLayout.contact.errorType"))).toBeNull()
    expect(screen.queryByText(t("accountLayout.contact.errorPhone"))).toBeNull()
  })

  it("renders the phone fieldset label and checkboxes", () => {
    render(<FieldsetWrapper />)
    expect(screen.getByText(t("accountLayout.contact.phoneLabel"))).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: t("label.applicantNoPhone") })).toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: t("label.applicantAdditionalPhone") })
    ).toBeInTheDocument()
  })

  it("renders phone validation errors", async () => {
    const user = userEvent.setup()
    render(<FieldsetWrapper />)
    const phoneInput = screen.getByRole("textbox")

    await user.type(phoneInput, "123")
    expect(screen.queryByText(t("accountLayout.contact.errorPhone"))).not.toBeNull()

    await user.clear(phoneInput)
    expect(screen.queryByText(t("accountLayout.contact.errorMissing"))).not.toBeNull()

    await user.type(phoneInput, "4155550199")
    expect(screen.queryByText(t("accountLayout.contact.errorPhone"))).toBeNull()
    expect(screen.queryByText(t("accountLayout.contact.errorMissing"))).toBeNull()
  })

  it("renders phone type validation error", async () => {
    const user = userEvent.setup()
    render(<FieldsetWrapper />)

    await user.click(screen.getByRole("combobox"))
    await user.tab()

    expect(screen.queryByText(t("accountLayout.contact.errorType"))).not.toBeNull()
  })

  it("disables phone fields when no phone is checked", async () => {
    const user = userEvent.setup()
    render(<FieldsetWrapper />)

    await user.click(screen.getByRole("checkbox", { name: t("label.applicantNoPhone") }))

    expect(screen.getByRole("textbox")).toBeDisabled()
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("shows second phone fields when second phone is checked", async () => {
    const user = userEvent.setup()
    render(<FieldsetWrapper />)

    await user.click(screen.getByRole("checkbox", { name: t("label.applicantAdditionalPhone") }))

    expect(screen.getAllByRole("textbox")).toHaveLength(2)
    expect(screen.getAllByRole("combobox")).toHaveLength(2)
  })

  it("disables no phone checkbox when second phone is checked", async () => {
    const user = userEvent.setup()
    render(<FieldsetWrapper />)

    await user.click(screen.getByRole("checkbox", { name: t("label.applicantAdditionalPhone") }))

    expect(screen.getByRole("checkbox", { name: t("label.applicantNoPhone") })).toBeDisabled()
  })

  it("includes second phone in submit data", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    const SubmitWrapper = () => {
      const formMethods = useForm({ mode: "onSubmit", defaultValues })

      return (
        <FormProvider {...formMethods}>
          <form
            onSubmit={(event) => {
              formMethods
                .handleSubmit(onSubmit)(event)
                .catch(() => {})
            }}
          >
            <PhoneFieldset />
            <button type="submit">Save</button>
          </form>
        </FormProvider>
      )
    }

    render(<SubmitWrapper />)

    await user.type(screen.getByRole("textbox"), "4155550199")
    await user.selectOptions(screen.getByRole("combobox"), "Cell")
    await user.click(screen.getByRole("checkbox", { name: t("label.applicantAdditionalPhone") }))

    const [, secondPhone] = screen.getAllByRole("textbox")
    await user.type(secondPhone, "5105550199")
    await user.selectOptions(screen.getAllByRole("combobox")[1], "Home")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        secondPhoneCheckbox: true,
        secondPhone: "510-555-0199",
        secondPhoneType: "Home",
      })
    )
  })

  describe("handlePhoneServerErrors", () => {
    it("sets a generic server error on the phone field", () => {
      const error = {
        response: {
          status: 500,
          data: { errors: { full_messages: [] } },
        },
      } as unknown as ExpandedAccountAxiosError

      expect(handlePhoneServerErrors(error)).toEqual([
        "phone",
        {
          message: "phone:server:generic",
          shouldFocus: true,
        },
      ])
    })
  })

  describe("phoneFieldsetErrors", () => {
    const testCases = [
      {
        key: "phone:missing",
        abbreviated: false,
        expected: "accountLayout.contact.errorMissing",
      },
      {
        key: "phone:missing",
        abbreviated: true,
        expected: "accountLayout.contact.errorMissing",
      },
      {
        key: "phone:type",
        abbreviated: false,
        expected: "accountLayout.contact.errorType",
      },
      {
        key: "phone:type",
        abbreviated: true,
        expected: "accountLayout.contact.errorType",
      },
      {
        key: "phone:invalid",
        abbreviated: false,
        expected: "accountLayout.contact.errorPhone",
      },
      {
        key: "phone:invalid",
        abbreviated: true,
        expected: "accountLayout.contact.errorPhoneBanner",
      },
      {
        key: "phone:server:generic",
        abbreviated: false,
        expected: "error.account.genericServerError",
      },
      {
        key: "phone:server:generic",
        abbreviated: true,
        expected: "error.account.genericServerError.abbreviated",
      },
    ]

    testCases.forEach(({ key, abbreviated, expected }) => {
      it(`returns correct error message for ${key} with abbreviated=${abbreviated}`, () => {
        expect(getErrorMessage(key, phoneFieldsetErrors, abbreviated)).toBe(t(expected))
      })
    })
  })
})
