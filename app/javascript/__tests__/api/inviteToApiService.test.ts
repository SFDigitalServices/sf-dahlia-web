import { post } from "../../api/apiService"
import {
  recordResponse,
  logHumanVerifiedClick,
  beaconHumanVerifiedClick,
  snapshotBrowser,
  HumanVerifiedRecord,
} from "../../api/inviteToApiService"
import { INVITE_TO_X } from "../../modules/constants"

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
}))

const humanRecord: HumanVerifiedRecord = {
  listingId: "a0w123",
  appId: "a0o123",
  deadline: "2099-01-01",
  act: "yes",
  type: INVITE_TO_X.APPLY,
  trigger: "interaction",
  elapsedMs: 1234,
  browser: snapshotBrowser(),
}

describe("inviteToApiService", () => {
  describe("recordResponse", () => {
    it("calls apiService post", async () => {
      post as jest.Mock
      const token = "token123"
      const record = {
        action: "submit",
      }
      await recordResponse(token, record)
      expect(post).toHaveBeenCalledWith("/api/v1/next-steps/record-response", {
        t: token,
        record,
      })
    })
  })

  describe("logHumanVerifiedClick", () => {
    it("calls apiService post", async () => {
      await logHumanVerifiedClick(humanRecord)
      expect(post).toHaveBeenCalledWith("/api/v1/next-steps/log-human-verified", {
        record: humanRecord,
      })
    })
  })

  describe("snapshotBrowser", () => {
    it("captures passive browser signals used to classify ambiguous clicks", () => {
      const browser = snapshotBrowser()
      expect(browser).toEqual(
        expect.objectContaining({
          webdriver: expect.any(Boolean),
          userAgent: expect.any(String),
          maxTouchPoints: expect.any(Number),
          coarsePointer: expect.any(Boolean),
          screen: expect.stringMatching(/\d+x\d+@/),
        })
      )
    })

    // This runs inside the fire path, so a throwing property must never take the signal
    // with it - some webviews raise on these reads rather than returning undefined.
    it("falls back per-field when a property getter throws", () => {
      const spy = jest.spyOn(navigator, "userAgent", "get").mockImplementation(() => {
        throw new Error("blocked")
      })

      expect(() => snapshotBrowser()).not.toThrow()
      expect(snapshotBrowser().userAgent).toBe("")
      // Other fields still populate normally.
      expect(snapshotBrowser().screen).toMatch(/\d+x\d+@/)

      spy.mockRestore()
    })
  })

  describe("beaconHumanVerifiedClick", () => {
    afterEach(() => {
      // jsdom has no sendBeacon, so remove the stub to restore the "unavailable" baseline.
      Reflect.deleteProperty(navigator, "sendBeacon")
    })

    it("sends a beacon to the log endpoint and returns its result", () => {
      const sendBeacon = jest.fn().mockReturnValue(true)
      Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true })

      const result = beaconHumanVerifiedClick({ ...humanRecord, trigger: "pageExit" })

      expect(result).toBe(true)
      expect(sendBeacon).toHaveBeenCalledWith(
        "/api/v1/next-steps/log-human-verified",
        expect.any(Blob)
      )
    })

    it("returns false when sendBeacon is unavailable", () => {
      expect(beaconHumanVerifiedClick({ ...humanRecord, trigger: "pageExit" })).toBe(false)
    })
  })
})
