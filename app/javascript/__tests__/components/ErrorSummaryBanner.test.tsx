import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import {
  ErrorSummaryBanner,
  scrollToErrorOnSubmit,
} from "../../pages/account/components/ErrorSummaryBanner"
import { DeepMap, FieldValues, FieldError } from "react-hook-form"

window.HTMLElement.prototype.scrollIntoView = jest.fn()

describe("ErrorSummaryBanner", () => {
  test("displays no errors when errors is empty", () => {
    render(<ErrorSummaryBanner errors={{}} />)
    const errorItems = screen.queryAllByRole("listitem")
    expect(errorItems).toHaveLength(0)
  })

  test("displays errors when present", () => {
    render(
      <ErrorSummaryBanner
        errors={{
          birthMonth: {
            message: "name:firstName",
            ref: { name: "input#firstName.input" },
            type: "required",
          },
          firstName: {
            message: "password:required",
            ref: { name: "input#password.input" },
            type: "required",
          },
        }}
      />
    )
    const errorItems = screen.getAllByRole("listitem")
    expect(errorItems).toHaveLength(2)
  })

  test("will call messageMap if provided", () => {
    const messageMap = jest.fn((message) => message)
    render(
      <ErrorSummaryBanner
        errors={{
          birthMonth: {
            message: "name:firstName",
            ref: { name: "input#firstName.input" },
            type: "required",
          },
        }}
        messageMap={messageMap}
      />
    )
    expect(messageMap).toHaveBeenCalledWith("name:firstName")
  })

  it("should call scrollIntoView and focus on click", () => {
    const errorRef = { current: document.createElement("input") }
    errorRef.current.scrollIntoView = jest.fn()
    errorRef.current.focus = jest.fn()

    const errors = {
      firstName: { ref: errorRef.current, message: "First name is required" },
    }

    render(<ErrorSummaryBanner errors={errors} />)

    const button = screen.getByText("First name is required")
    fireEvent.click(button)

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(errorRef.current.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    })
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(errorRef.current.focus).toHaveBeenCalled()
  })

  describe("scrollToErrorOnSubmit", () => {
    let bannerRef: React.MutableRefObject<HTMLSpanElement>
    let errors: DeepMap<FieldValues, FieldError>

    beforeEach(() => {
      bannerRef = { current: document.createElement("span") }
      errors = {}
      jest.clearAllMocks()
    })

    it("should not scroll if there are no errors", () => {
      const scrollToError = scrollToErrorOnSubmit(bannerRef)
      scrollToError(errors)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
    })

    it("should scroll to the first error if there is only one", () => {
      const errorRef = { current: document.createElement("input") }
      errorRef.current.scrollIntoView = jest.fn()
      errors = {
        firstName: { ref: errorRef.current, message: "First name is required" },
      }

      const scrollToError = scrollToErrorOnSubmit(bannerRef)
      scrollToError(errors)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(errorRef.current.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      })
    })

    it("should scroll to the DOB error if there is only one", () => {
      const errorRef = { current: document.createElement("input") }
      errorRef.current.scrollIntoView = jest.fn()
      errors = {
        dobObject: {
          birthDay: { ref: errorRef.current, message: "dob:missing", type: "required" },
          birthMonth: { ref: errorRef.current, message: "dob:missing", type: "required" },
          birthYear: { ref: errorRef.current, message: "dob:missing", type: "required" },
        },
      }

      const scrollToError = scrollToErrorOnSubmit(bannerRef)
      scrollToError(errors)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(errorRef.current.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      })
    })

    it("should scroll to the banner ref if there are multiple errors", () => {
      const errorRef = { current: document.createElement("input") }
      bannerRef.current.scrollIntoView = jest.fn()
      errors = {
        firstName: { ref: errorRef.current, message: "First name is required" },
        lastName: { ref: errorRef.current, message: "Last name is required" },
      }

      const scrollToError = scrollToErrorOnSubmit(bannerRef)
      scrollToError(errors)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(bannerRef.current.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      })
    })
  })
})
