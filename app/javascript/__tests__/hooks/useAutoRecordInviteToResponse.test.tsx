import { renderHook, cleanup } from "@testing-library/react"
import { useAutoRecordInviteToResponse } from "../../hooks/useAutoRecordInviteToResponse"
import { recordResponse, logHumanVerifiedClick } from "../../api/inviteToApiService"

jest.mock("../../api/inviteToApiService", () => ({
  recordResponse: jest.fn(),
  logHumanVerifiedClick: jest.fn(),
}))

const setVisibility = (state: "visible" | "hidden") => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  })
}

const fireVisibilityChange = () => {
  document.dispatchEvent(new Event("visibilitychange"))
}

const flushRenderGateFrames = () => {
  // Two nested requestAnimationFrame calls need to resolve.
  jest.advanceTimersByTime(100)
}

const baseArgs = {
  enabled: true,
  act: "yes" as const,
  appId: "app-1",
  listingId: "listing-1",
  deadline: "3000-01-01",
  type: "I2A",
}

describe("useAutoRecordInviteToResponse", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    sessionStorage.clear()
    setVisibility("visible")
    ;(recordResponse as jest.Mock).mockResolvedValue(undefined)
    ;(logHumanVerifiedClick as jest.Mock).mockResolvedValue(undefined)
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it("fires recordResponse once after the dwell timer when visible", () => {
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))

    flushRenderGateFrames()
    jest.advanceTimersByTime(2000)

    expect(recordResponse).toHaveBeenCalledTimes(1)
    expect(recordResponse).toHaveBeenCalledWith({
      appId: "app-1",
      applicationNumber: "app-1",
      listingId: "listing-1",
      deadline: "3000-01-01",
      action: "yes",
      response: "yes",
      type: "I2A",
    })
  })

  it("fires early on pointermove before the dwell timer elapses, only once", () => {
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))

    flushRenderGateFrames()
    window.dispatchEvent(new Event("pointermove"))

    expect(recordResponse).toHaveBeenCalledTimes(1)

    // Advancing past the dwell time should not cause a second call.
    jest.advanceTimersByTime(2000)
    expect(recordResponse).toHaveBeenCalledTimes(1)
  })

  it("does not fire while hidden; fires after visibilitychange to visible + dwell", () => {
    setVisibility("hidden")
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))

    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()

    setVisibility("visible")
    fireVisibilityChange()
    flushRenderGateFrames()
    jest.advanceTimersByTime(2000)

    expect(recordResponse).toHaveBeenCalledTimes(1)
  })

  it("does not fire when enabled is false", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, enabled: false }))
    flushRenderGateFrames()
    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it("does not fire when act is missing", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, act: undefined }))
    flushRenderGateFrames()
    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it('does not fire when act is "submit"', () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, act: "submit" }))
    flushRenderGateFrames()
    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it("does not fire when deadline has passed", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, deadline: "2000-01-01" }))
    flushRenderGateFrames()
    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it("does not fire when the sessionStorage guard is already set", () => {
    sessionStorage.setItem(`i2x-recorded-${baseArgs.appId}-${baseArgs.act}`, "true")
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushRenderGateFrames()
    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it("sets the sessionStorage guard so a remount does not fire again", () => {
    const { unmount } = renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushRenderGateFrames()
    jest.advanceTimersByTime(2000)
    expect(recordResponse).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(`i2x-recorded-${baseArgs.appId}-${baseArgs.act}`)).toBe("true")
    unmount()

    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushRenderGateFrames()
    jest.advanceTimersByTime(5000)
    expect(recordResponse).toHaveBeenCalledTimes(1)
  })

  describe("shadow mode", () => {
    const shadowArgs = { ...baseArgs, mode: "shadow" as const }

    it("fires logHumanVerifiedClick (not recordResponse) after dwell, with trigger and elapsed", () => {
      renderHook(() => useAutoRecordInviteToResponse(shadowArgs))

      flushRenderGateFrames()
      jest.advanceTimersByTime(2000)

      expect(recordResponse).not.toHaveBeenCalled()
      expect(logHumanVerifiedClick).toHaveBeenCalledTimes(1)
      expect(logHumanVerifiedClick).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: "app-1",
          listingId: "listing-1",
          deadline: "3000-01-01",
          act: "yes",
          type: "I2A",
          trigger: "dwell",
        })
      )
    })

    it("reports trigger 'interaction' when fired by a user event", () => {
      renderHook(() => useAutoRecordInviteToResponse(shadowArgs))

      flushRenderGateFrames()
      window.dispatchEvent(new Event("pointermove"))

      expect(logHumanVerifiedClick).toHaveBeenCalledTimes(1)
      expect(logHumanVerifiedClick).toHaveBeenCalledWith(
        expect.objectContaining({ trigger: "interaction" })
      )
    })

    it("uses a shadow-specific guard so an on-mode remount can still record", () => {
      const { unmount } = renderHook(() => useAutoRecordInviteToResponse(shadowArgs))
      flushRenderGateFrames()
      jest.advanceTimersByTime(2000)
      expect(logHumanVerifiedClick).toHaveBeenCalledTimes(1)
      expect(sessionStorage.getItem(`i2x-shadow-${baseArgs.appId}-${baseArgs.act}`)).toBe("true")
      unmount()

      renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, mode: "on" }))
      flushRenderGateFrames()
      jest.advanceTimersByTime(2000)
      expect(recordResponse).toHaveBeenCalledTimes(1)
    })
  })

  it('does not fire when mode is "off"', () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, mode: "off" }))
    flushRenderGateFrames()
    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("proceeds and fires when sessionStorage access throws (private mode)", () => {
    const getItemSpy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked")
    })
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked")
    })

    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushRenderGateFrames()
    jest.advanceTimersByTime(2000)

    expect(recordResponse).toHaveBeenCalledTimes(1)
    getItemSpy.mockRestore()
  })

  it("logs an error when the record request rejects", async () => {
    ;(recordResponse as jest.Mock).mockRejectedValueOnce(new Error("api fail"))

    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushRenderGateFrames()
    jest.advanceTimersByTime(2000)
    await Promise.resolve()
    await Promise.resolve()

    expect(console.error).toHaveBeenCalledWith(
      "Error auto-recording invite-to response:",
      expect.any(Error)
    )
  })

  it("resets the fire conditions when the page becomes hidden again before firing", () => {
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushRenderGateFrames() // arms while visible

    setVisibility("hidden")
    fireVisibilityChange() // else branch: clears the dwell timer + listeners

    jest.advanceTimersByTime(5000)
    expect(recordResponse).not.toHaveBeenCalled()
  })

  it("cleans up on unmount before dwell elapses with no call and no leaked listeners/timers", () => {
    const { unmount } = renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushRenderGateFrames()
    unmount()

    expect(() => {
      jest.advanceTimersByTime(5000)
      window.dispatchEvent(new Event("pointermove"))
    }).not.toThrow()
    expect(recordResponse).not.toHaveBeenCalled()
  })
})
