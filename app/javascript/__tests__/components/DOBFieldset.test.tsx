 
import { DOBFieldValues, t } from "@bloom-housing/ui-components"
import {
  deduplicateDOBErrors,
  dobFieldsetErrors,
  handleDOBServerErrors,
} from "../../pages/account/components/DOBFieldset"
import { FieldError, DeepMap } from "react-hook-form"
import { ExpandedAccountAxiosError, getErrorMessage } from "../../pages/account/components/util"

describe("DOBFieldset", () => {
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
