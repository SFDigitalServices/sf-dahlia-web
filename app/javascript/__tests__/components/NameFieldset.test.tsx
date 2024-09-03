import { handleNameServerErrors, nameErrorsMap } from "../../pages/account/components/NameFieldset"

describe("NameFieldset", () => {
  describe("handleNameServerErrors", () => {
    test("should set error to genericServer", () => {
      const setError = jest.fn()
      const handler = handleNameServerErrors(setError)
      handler()

      expect(setError).toHaveBeenCalledWith("firstName", {
        message: "error:name:genericServer",
        shouldFocus: true,
      })
    })
  })
  describe("nameErrorsMap", () => {
    test("returns correct error messages based on errorKey and abbreviated flag", () => {
      const testCases = [
        { errorKey: "error:firstName", abbreviated: false, expected: "Enter first name" },
        { errorKey: "error:lastName", abbreviated: false, expected: "Enter last name" },
        {
          errorKey: "unknown:error",
          abbreviated: false,
          expected: "Something went wrong. Try again or check back later.",
        },
        {
          errorKey: "unknown:error",
          abbreviated: true,
          expected: "Something went wrong",
        },
        { errorKey: "", abbreviated: false, expected: undefined },
      ]

      testCases.forEach(({ errorKey, abbreviated, expected }) => {
        const result = nameErrorsMap(errorKey, abbreviated)
        expect(result).toBe(expected)
      })
    })
  })
})
