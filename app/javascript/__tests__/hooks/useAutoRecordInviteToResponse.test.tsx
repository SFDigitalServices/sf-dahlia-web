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

const flushPaintFrames = () => {
  // Two nested requestAnimationFrame calls need to resolve.
  jest.advanceTimersByTime(100)
}

const baseArgs = {
  mode: "shadow" as const,
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
    setVisibility("visible")
    ;(logHumanVerifiedClick as jest.Mock).mockResolvedValue(undefined)
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it("logs the human-verified click once after the dwell timer when visible", () => {
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))

    flushPaintFrames()
    jest.advanceTimersByTime(2000)

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

  it("never records the response (recording stays server-side for now)", () => {
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))

    flushPaintFrames()
    jest.advanceTimersByTime(5000)

    expect(recordResponse).not.toHaveBeenCalled()
  })

  it("fires early on pointermove before the dwell timer elapses, only once", () => {
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))

    flushPaintFrames()
    window.dispatchEvent(new Event("pointermove"))

    expect(logHumanVerifiedClick).toHaveBeenCalledTimes(1)
    expect(logHumanVerifiedClick).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: "interaction" })
    )

    // Advancing past the dwell time should not cause a second call.
    jest.advanceTimersByTime(2000)
    expect(logHumanVerifiedClick).toHaveBeenCalledTimes(1)
  })

  it("does not fire while hidden; fires after visibilitychange to visible + dwell", () => {
    setVisibility("hidden")
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))

    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()

    setVisibility("visible")
    fireVisibilityChange()
    flushPaintFrames()
    jest.advanceTimersByTime(2000)

    expect(logHumanVerifiedClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire when mode is "off"', () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, mode: "off" }))
    flushPaintFrames()
    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("does not fire when the mode prop is absent", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, mode: undefined }))
    flushPaintFrames()
    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("does not fire for a test/preview link", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, isTest: true }))
    flushPaintFrames()
    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("does not fire on the documents page", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, documentsPath: true }))
    flushPaintFrames()
    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("does not fire when act is missing", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, act: undefined }))
    flushPaintFrames()
    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it('does not fire when act is "submit"', () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, act: "submit" }))
    flushPaintFrames()
    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("does not fire when deadline has passed", () => {
    renderHook(() => useAutoRecordInviteToResponse({ ...baseArgs, deadline: "2000-01-01" }))
    flushPaintFrames()
    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("logs again on a remount (no session guard, so repeat loads stay visible in logs)", () => {
    const { unmount } = renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushPaintFrames()
    jest.advanceTimersByTime(2000)
    expect(logHumanVerifiedClick).toHaveBeenCalledTimes(1)
    unmount()

    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushPaintFrames()
    jest.advanceTimersByTime(2000)
    expect(logHumanVerifiedClick).toHaveBeenCalledTimes(2)
  })

  it("logs an error when the log request rejects", async () => {
    ;(logHumanVerifiedClick as jest.Mock).mockRejectedValueOnce(new Error("api fail"))

    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushPaintFrames()
    jest.advanceTimersByTime(2000)
    await Promise.resolve()
    await Promise.resolve()

    expect(console.error).toHaveBeenCalledWith(
      "Error logging human-verified invite-to click:",
      expect.any(Error)
    )
  })

  it("resets the fire conditions when the page becomes hidden again before firing", () => {
    renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushPaintFrames() // arms while visible

    setVisibility("hidden")
    fireVisibilityChange() // else branch: clears the dwell timer + listeners

    jest.advanceTimersByTime(5000)
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })

  it("cleans up on unmount before dwell elapses with no call and no leaked listeners/timers", () => {
    const { unmount } = renderHook(() => useAutoRecordInviteToResponse(baseArgs))
    flushPaintFrames()
    unmount()

    expect(() => {
      jest.advanceTimersByTime(5000)
      window.dispatchEvent(new Event("pointermove"))
    }).not.toThrow()
    expect(logHumanVerifiedClick).not.toHaveBeenCalled()
  })
})
