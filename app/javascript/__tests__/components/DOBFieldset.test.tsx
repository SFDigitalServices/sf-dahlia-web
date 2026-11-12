/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { DOBFieldValues, t } from "@bloom-housing/ui-components"
import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import DOBFieldset, {
  deduplicateDOBErrors,
  dobFieldsetErrors,
  handleDOBServerErrors,
} from "../../pages/account/components/DOBFieldset"
import { FieldError, DeepMap, useForm } from "react-hook-form"
import { ExpandedAccountAxiosError, getErrorMessage } from "../../pages/account/components/util"

const DOBFormWrapper = ({ onSubmit }: { onSubmit: () => void }) => {
  const { register, watch, errors, handleSubmit } = useForm({ mode: "onSubmit" })

  return (
    <form
      onSubmit={(event) => {
        handleSubmit(onSubmit)(event).catch(() => {})
      }}
    >
      <DOBFieldset required register={register} watch={watch} error={errors.dobObject} />
      <button type="submit">Submit</button>
    </form>
  )
}

const submitDOB = async (month: string, day: string, year: string) => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(t("label.dobMonth")), month)
  await user.type(screen.getByLabelText(t("label.dobDay")), day)
  await user.type(screen.getByLabelText(t("label.dobYear")), year)
  await user.click(screen.getByRole("button", { name: "Submit" }))
}

describe("DOBFieldset", () => {
  describe("date of birth validation", () => {
    let onSubmit: jest.Mock

    beforeEach(() => {
      document.documentElement.lang = "en"
      // Only Date is faked; faking timers starves user-event and react-hook-form's async validation.
      jest.useFakeTimers({
        now: new Date(2026, 10, 10, 12, 0, 0),
        doNotFake: [
          "hrtime",
          "nextTick",
          "performance",
          "queueMicrotask",
          "requestAnimationFrame",
          "cancelAnimationFrame",
          "requestIdleCallback",
          "cancelIdleCallback",
          "setImmediate",
          "clearImmediate",
          "setInterval",
          "clearInterval",
          "setTimeout",
          "clearTimeout",
        ],
      })
      onSubmit = jest.fn()
      render(<DOBFormWrapper onSubmit={onSubmit} />)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    const expectAgeError = async () => {
      expect(
        await screen.findByText(t("error.account.dobTooYoung.abbreviated"), { exact: false })
      ).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    }

    const expectAccepted = async () => {
      await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    }

    // Given today is 2026-11-10
    // When a 17-year-old enters month 12, day 5, year 2008
    // Then they see the too-young error
    it("rejects a 17-year-old whose month and day would read as an adult birthday if swapped", async () => {
      await submitDOB("12", "5", "2008")
      await expectAgeError()
    })

    // Given today is 2026-11-10
    // When an 18-year-old enters month 1, day 20, year 2008
    // Then the form submits
    it("accepts an 18-year-old whose day is greater than 12", async () => {
      await submitDOB("1", "20", "2008")
      await expectAccepted()
    })

    // Given today is 2026-11-10
    // When someone turning 18 today enters month 11, day 10, year 2008
    // Then the form submits
    it("accepts a date of birth exactly 18 years ago today", async () => {
      await submitDOB("11", "10", "2008")
      await expectAccepted()
    })

    // Given today is 2026-11-10
    // When someone turning 18 tomorrow enters month 11, day 11, year 2008
    // Then they see the too-young error
    it("rejects a date of birth one day short of 18 years", async () => {
      await submitDOB("11", "11", "2008")
      await expectAgeError()
    })
  })

  describe("deduplicateDOBErrors", () => {
    it("should consolidate errors with the same message", () => {
      const errors: DeepMap<DOBFieldValues, FieldError> = {
        birthDay: {
          message: "error:dob:missing",
          ref: { name: "input#dobObject.birthDay.input" } as any,
          type: "required",
        },
        birthMonth: {
          message: "error:dob:missing",
          ref: { name: "input#dobObject.birthMonth.input" } as any,
          type: "required",
        },
        birthYear: {
          message: "error:dob:missing",
          ref: { name: "input#dobObject.birthYear.input" } as any,
          type: "required",
        },
      }

      const result = deduplicateDOBErrors(errors)

      expect(Object.keys(result)).toHaveLength(1)
      expect(result.birthDay).toBeDefined()
      expect(result.birthDay.message).toBe("error:dob:missing")
      expect(result.birthDay.ref).toEqual(errors.birthDay.ref)
      expect(result.birthDay.type).toBe("required")
    })

    it("should handle cases with unique messages", () => {
      const errors: DeepMap<DOBFieldValues, FieldError> = {
        birthDay: {
          message: "error:dob:missing",
          ref: { name: "input#dobObject.birthDay.input" } as any,
          type: "required",
        },
        birthMonth: {
          message: "error:month:missing",
          ref: { name: "input#dobObject.birthMonth.input" } as any,
          type: "required",
        },
        birthYear: {
          message: "error:year:missing",
          ref: { name: "input#dobObject.birthYear.input" } as any,
          type: "required",
        },
      }

      const result = deduplicateDOBErrors(errors)

      expect(Object.keys(result)).toHaveLength(3)
      expect(result.birthDay).toBeDefined()
      expect(result.birthMonth).toBeDefined()
      expect(result.birthYear).toBeDefined()
    })

    it("should return an empty object when no errors are passed", () => {
      const errors: DeepMap<DOBFieldValues, FieldError> = {}

      const result = deduplicateDOBErrors(errors)

      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe("handleDOBServerErrors", () => {
    it("sets age error for 422 status", () => {
      const error = {
        response: {
          status: 422,
        },
      } as ExpandedAccountAxiosError

      const errorReturn = handleDOBServerErrors(error)

      expect(errorReturn).toEqual([
        "dobObject.birthYear",
        {
          message: "dob:invalid",
          shouldFocus: true,
          type: "range",
        },
      ])
    })

    it("sets generic error for non-422 status", () => {
      const error = {
        response: {
          status: 500,
        },
      } as ExpandedAccountAxiosError

      const errorReturn = handleDOBServerErrors(error)

      expect(errorReturn).toEqual([
        "dobObject.birthYear",
        {
          message: "dob:server:generic",
          shouldFocus: true,
        },
      ])
    })
  })

  describe("dobErrorsMap", () => {
    const testCases = [
      {
        key: "dob:invalid",
        abbreviated: false,
        expected: "error.account.dob",
      },
      {
        key: "dob:invalid",
        abbreviated: true,
        expected: "error.account.dob.abbreviated",
      },
      {
        key: "dob:missing",
        abbreviated: false,
        expected: "error.account.dobMissing",
      },
      {
        key: "dob:missing",
        abbreviated: true,
        expected: "error.account.dobMissing.abbreviated",
      },
      {
        key: "dob:age",
        abbreviated: false,
        expected: "error.account.dobTooYoung",
      },
      {
        key: "dob:age",
        abbreviated: true,
        expected: "error.account.dobTooYoung.abbreviated",
      },
      {
        key: "dob:server:generic",
        abbreviated: false,
        expected: "error.account.genericServerError",
      },
      {
        key: "dob:server:generic",
        abbreviated: true,
        expected: "error.account.genericServerError.abbreviated",
      },
    ]

    testCases.forEach(({ key, abbreviated, expected }) => {
      it(`returns correct error message for ${key} with abbreviated=${abbreviated}`, () => {
        expect(getErrorMessage(key, dobFieldsetErrors, abbreviated)).toBe(t(expected))
      })
    })
  })
})
