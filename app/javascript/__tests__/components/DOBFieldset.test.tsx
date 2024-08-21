/* eslint-disable @typescript-eslint/no-explicit-any */
import { DOBFieldValues } from "@bloom-housing/ui-components"
import {
  deduplicateDOBErrors,
  dobErrorsMap,
  handleDOBServerErrors,
} from "../../pages/account/components/DOBFieldset"
import { FieldError, DeepMap } from "react-hook-form"
import { AxiosError } from "axios"
import { act } from "@testing-library/react"

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
      const setError = jest.fn()
      const errorCallback = jest.fn()
      const error = {
        response: {
          status: 422,
        },
      } as AxiosError

      const handleError = handleDOBServerErrors(setError, errorCallback)

      act(() => {
        handleError(error)
      })

      expect(setError).toHaveBeenCalledWith("dobObject.birthYear", {
        message: "error:dob:age",
        shouldFocus: true,
        type: "range",
      })
      expect(errorCallback).toHaveBeenCalled()
    })

    test("sets generic error for non-422 status", () => {
      const setError = jest.fn()
      const errorCallback = jest.fn()
      const error = {
        response: {
          status: 500,
        },
      } as AxiosError

      const handleError = handleDOBServerErrors(setError, errorCallback)

      act(() => {
        handleError(error)
      })

      expect(setError).toHaveBeenCalledWith("dobObject.birthYear", {
        message: "error:dob:generic",
        shouldFocus: true,
      })
      expect(errorCallback).toHaveBeenCalled()
    })
  })

  describe("dobErrorsMap", () => {
    test("returns correct error message", () => {
      expect(dobErrorsMap("error:dob:invalid", false)).toBe(
        "Enter a valid date of birth. Enter date like: MM DD YYYY"
      )
      expect(dobErrorsMap("error:dob:invalid", true)).toBe("Enter a valid date of birth")
      expect(dobErrorsMap("error:dob:missing", false)).toBe("Enter date like: MM DD YYYY")
      expect(dobErrorsMap("error:dob:missing", true)).toBe("Enter date of birth")
      expect(dobErrorsMap("error:dob:age", false)).toBe(
        "You must be 18 or older. If you are under 18, email <a href='mailto:sfhousinginfo@sfgov.org'>sfhousinginfo@sfgov.org</a> to get info on housing resources for youth"
      )
      expect(dobErrorsMap("error:dob:age", true)).toBe("You must be 18 or older")
      expect(dobErrorsMap("unknown:error", false)).toBe("An error occurred. Please try again")
      expect(dobErrorsMap("unknown:error", true)).toBe("An error occurred")
    })
  })
})
