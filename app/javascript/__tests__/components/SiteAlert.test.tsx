import React from "react"
import { render } from "@testing-library/react"
import { SiteAlert, setSiteAlertMessage } from "../../components/SiteAlert"

const mockGetItem = jest.fn()
const mockSetItem = jest.fn()
const mockRemoveItem = jest.fn()
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: (...args: string[]) => mockGetItem(...args),
    setItem: (...args: string[]) => mockSetItem(...args),
    removeItem: (...args: string[]) => mockRemoveItem(...args),
  },
})

describe("<SiteAlert>", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it("can set an alert in session storage", () => {
    setSiteAlertMessage("Alert Message Goes Here", "success")
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockSetItem).toHaveBeenCalledWith("alert_message_success", "Alert Message Goes Here")
  })

  it("can render an alert from session storage", () => {
    window.sessionStorage.setItem("alert_message_alert", "Alert Message Goes Here")
    render(<SiteAlert />)
    expect(mockGetItem).toHaveBeenCalledWith("alert_message_alert")
  })
})
