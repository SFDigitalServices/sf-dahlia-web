import React from "react"
import { act, render, screen, waitFor, fireEvent } from "@testing-library/react"
import IdleTimeout from "../../authentication/components/IdleTimeout"
import UserContext from "../../authentication/context/UserContext"
import { mockProfileStub } from "../__util__/accountUtils"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import TagManager from "react-gtm-module"

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

const idleTimeoutDelay = 30 * 60 * 1000
const promptTimeoutDelay = 60000

jest.mock("@bloom-housing/ui-seeds", () => {
  const originalModule = jest.requireActual("@bloom-housing/ui-seeds")

  const MockDialog = ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="modalMock">{children}</div> : null
  MockDialog.Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  MockDialog.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  MockDialog.Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  return {
    __esModule: true,
    ...originalModule,
    Dialog: MockDialog,
  }
})

describe("IdleTimeout", () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = { ...window.location }
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    })
  })

  it("renders null when not logged in and useFormTimeout false", () => {
    const { container } = render(
      <UserContext.Provider value={{ profile: undefined }}>
        <IdleTimeout />
      </UserContext.Provider>
    )
    expect(container.firstChild).toBeNull()
  })

  it("triggers auto timeout when user is logged in", async () => {
    const timeOutMock = jest.fn()
    const utils = await renderAndLoadAsync(
      <UserContext.Provider value={{ profile: mockProfileStub, timeOut: timeOutMock }}>
        <IdleTimeout pageName="testPage" />
      </UserContext.Provider>
    )

    act(() => {
      jest.advanceTimersByTime(idleTimeoutDelay)
    })
    await waitFor(() => screen.getByText(/stay logged in\?/i))

    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          label: "testPage",
          url: window.location.href,
          is_during_application_flow: false,
          user_id: mockProfileStub.id,
        }),
      })
    )

    act(() => {
      jest.advanceTimersByTime(promptTimeoutDelay)
    })

    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          label: "testPage",
          url: window.location.href,
          action: "timed out and logged out",
          is_during_application_flow: false,
          user_id: mockProfileStub.id,
        }),
      })
    )
    expect(timeOutMock).toHaveBeenCalled()

    act(() => {
      utils.unmount()
      jest.runAllTimers()
    })
  })

  it("triggers auto timeout when user is not logged in", async () => {
    const timeOutMock = jest.fn()
    const utils = await renderAndLoadAsync(
      <UserContext.Provider value={{ profile: undefined, timeOut: timeOutMock }}>
        <IdleTimeout useFormTimeout pageName="testPage" />
      </UserContext.Provider>
    )

    act(() => {
      jest.advanceTimersByTime(idleTimeoutDelay)
    })
    await waitFor(() => screen.getByText(/stay logged in\?/i))

    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          label: "testPage",
          url: window.location.href,
          is_during_application_flow: false,
          user_id: undefined,
        }),
      })
    )

    act(() => {
      jest.advanceTimersByTime(promptTimeoutDelay)
    })

    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          label: "testPage",
          url: window.location.href,
          action: "timed out not logged in",
          is_during_application_flow: false,
          user_id: undefined,
        }),
      })
    )

    act(() => {
      utils.unmount()
      jest.runAllTimers()
    })
  })

  it("handles cancel action in prompt", async () => {
    const timeOutMock = jest.fn()
    const utils = await renderAndLoadAsync(
      <UserContext.Provider value={{ profile: mockProfileStub, timeOut: timeOutMock }}>
        <IdleTimeout pageName="testPage" />
      </UserContext.Provider>
    )

    act(() => {
      jest.advanceTimersByTime(idleTimeoutDelay)
    })
    await waitFor(() => screen.getByText(/stay logged in\?/i))

    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          label: "testPage",
          url: window.location.href,
          is_during_application_flow: false,
          user_id: mockProfileStub.id,
        }),
      })
    )

    fireEvent.click(screen.getByText(/continue/i))

    await waitFor(() => {
      expect(screen.queryByText(/stay logged in\?/i)).toBeNull()
    })

    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          label: "testPage",
          url: window.location.href,
          is_during_application_flow: false,
          user_id: mockProfileStub.id,
          action: "user prevented",
        }),
      })
    )

    act(() => {
      utils.unmount()
      jest.runAllTimers()
    })
  })
})
