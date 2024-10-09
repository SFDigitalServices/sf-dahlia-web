/* eslint-disable @typescript-eslint/no-explicit-any */
import { DOBFieldValues, t } from "@bloom-housing/ui-components"
import DOBFieldset, {
  deduplicateDOBErrors,
  dobFieldsetErrors,
  handleDOBServerErrors,
} from "../../pages/account/components/DOBFieldset"
import { FieldError, DeepMap } from "react-hook-form"
import { ExpandedAccountAxiosError, getErrorMessage } from "../../pages/account/components/util"
import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe("DOBFieldset", () => {
  describe("deduplicateDOBErrors", () => {
    test("should consolidate errors with the same message", () => {
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

    test("should handle cases with unique messages", () => {
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

    test("should return an empty object when no errors are passed", () => {
      const errors: DeepMap<DOBFieldValues, FieldError> = {}

      const result = deduplicateDOBErrors(errors)

      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe("handleDOBServerErrors", () => {
    test("sets age error for 422 status", () => {
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

    test("sets generic error for non-422 status", () => {
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
      test(`returns correct error message for ${key} with abbreviated=${abbreviated}`, () => {
        expect(getErrorMessage(key, dobFieldsetErrors, abbreviated)).toBe(t(expected))
      })
    })
  })

  describe("DOBFieldset handleInput", () => {
    it("should allow numeric keys", async () => {
      render(<DOBFieldset register={jest.fn()} watch={jest.fn()} />)
      const yearField: HTMLInputElement = screen.getByRole("spinbutton", {
        name: /year/i,
      })

      await userEvent.type(yearField, "1")
      expect(yearField.value).toBe("1")
    })

    it("should prevent non-numeric keys", async () => {
      render(<DOBFieldset register={jest.fn()} watch={jest.fn()} />)
      const yearField: HTMLInputElement = screen.getByRole("spinbutton", {
        name: /year/i,
      })

      await userEvent.type(yearField, "a")
      expect(yearField.value).toBe("")
    })

    it("should allow allowed keys like Backspace, Tab, Arrow keys, and Delete", async () => {
      render(<DOBFieldset register={jest.fn()} watch={jest.fn()} />)
      const yearField: HTMLInputElement = screen.getByRole("spinbutton", {
        name: /year/i,
      })

      await userEvent.type(yearField, "1")
      expect(yearField.value).toBe("1")

      await userEvent.type(yearField, "{backspace}")
      expect(yearField.value).toBe("")

      await userEvent.type(yearField, "{tab}")
      expect(yearField.value).toBe("")

      await userEvent.type(yearField, "{arrowleft}")
      expect(yearField.value).toBe("")

      await userEvent.type(yearField, "{arrowright}")
      expect(yearField.value).toBe("")

      await userEvent.type(yearField, "{delete}")
      expect(yearField.value).toBe("")
    })

    it("should prevent input when maxLength is reached and key is not allowed", async () => {
      render(<DOBFieldset register={jest.fn()} watch={jest.fn()} />)
      const yearField: HTMLInputElement = screen.getByRole("spinbutton", {
        name: /year/i,
      })

      // Simulate input reaching maxLength
      await userEvent.type(yearField, "1234")
      expect(yearField.value).toBe("1234")

      await userEvent.type(yearField, "5")
      expect(yearField.value).toBe("1234") // Value should not change
    })
  })
})
