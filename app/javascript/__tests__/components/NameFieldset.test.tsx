import { t } from "@bloom-housing/ui-components"
import {
  handleNameServerErrors,
  nameFieldsetErrors,
} from "../../pages/account/components/NameFieldset"
import { ExpandedAccountAxiosError, getErrorMessage } from "../../pages/account/components/util"

describe("NameFieldset", () => {
  describe("handleNameServerErrors", () => {
    test("should set error to genericServer", () => {
      const error = {
        response: {
          status: 422,
          data: { errors: { firstName: [], lastName: [], full_messages: [] } },
        },
      } as unknown as ExpandedAccountAxiosError

      const errorResponse = handleNameServerErrors("firstName", error)

      expect(errorResponse).toEqual([
        "firstName",
        {
          message: "name:server:generic",
          shouldFocus: true,
        },
      ])
    })

    test("should set name missing error", () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              full_messages: ["Firstname is empty", "Lastname is empty"],
              firstName: ["is empty"],
              lastName: ["is empty"],
            },
          },
        },
      } as unknown as ExpandedAccountAxiosError

      const firstNameErrorResponse = handleNameServerErrors("firstName", error)
      const lastNameErrorResponse = handleNameServerErrors("lastName", error)

      expect(lastNameErrorResponse).toEqual([
        "lastName",
        {
          message: "name:lastName",
          shouldFocus: true,
        },
      ])
      expect(firstNameErrorResponse).toEqual([
        "firstName",
        {
          message: "name:firstName",
          shouldFocus: true,
        },
      ])
    })
  })
  describe("nameErrorsMap", () => {
    const testCases = [
      {
        key: "name:firstName",
        abbreviated: false,
        expected: "error.account.firstName",
      },
      {
        key: "name:firstName",
        abbreviated: true,
        expected: "error.account.firstName",
      },
      {
        key: "name:lastName",
        abbreviated: false,
        expected: "error.account.lastName",
      },
      {
        key: "name:lastName",
        abbreviated: true,
        expected: "error.account.lastName",
      },
      {
        key: "name:server:generic",
        abbreviated: false,
        expected: "error.account.genericServerError",
      },
      {
        key: "name:server:generic",
        abbreviated: true,
        expected: "error.account.genericServerError.abbreviated",
      },
    ]

    testCases.forEach(({ key, abbreviated, expected }) => {
      test(`returns correct error message for ${key} with abbreviated=${abbreviated}`, () => {
        expect(getErrorMessage(key, nameFieldsetErrors, abbreviated)).toBe(t(expected))
      })
    })
  })
})
