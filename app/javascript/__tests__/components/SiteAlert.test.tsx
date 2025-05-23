import React from "react"
import { render } from "@testing-library/react"
import { SiteAlert, clearSiteAlertMessage, setSiteAlertMessage } from "../../components/SiteAlert"

const mockGetItem = jest.fn()
const mockSetItem = jest.fn()
const mockRemoveItem = jest.fn()
Object.defineProperty(window, "localStorage", {
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
    expect(mockSetItem).toHaveBeenCalledWith("alert_message_success", "Alert Message Goes Here")
  })

  it("can clear an alert in session storage", () => {
    clearSiteAlertMessage("success")
    expect(mockRemoveItem).toHaveBeenCalledWith("alert_message_success")
  })

  it("can render an alert from session storage", () => {
    window.localStorage.setItem("alert_message_alert", "Alert Message Goes Here")
    mockGetItem.mockImplementationOnce(() => "Alert Message Goes Here")
    const { getByText } = render(<SiteAlert />)

    expect(mockGetItem).toHaveBeenCalledWith("alert_message_alert")
    expect(getByText("Alert Message Goes Here")).toBeTruthy()
  })

  it("can render an alert from a parameter", () => {
    const { getByText } = render(
      <SiteAlert alertMessage={{ type: "alert", message: "Test alert message" }} />
    )

    expect(getByText("Test alert message")).toBeTruthy()
  })
})
