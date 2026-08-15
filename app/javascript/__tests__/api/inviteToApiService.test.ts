import { post } from "../../api/apiService"
import {
  recordResponse,
  logHumanVerifiedClick,
  beaconHumanVerifiedClick,
  snapshotEnv,
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
  env: snapshotEnv(),
}

describe("inviteToApiService", () => {
  describe("recordResponse", () => {
    it("calls apiService post", async () => {
      post as jest.Mock
      const token = "token123"
      const record = {
        listingId: "a0w123",
        appId: "a0o123",
        applicationNumber: "12345",
        deadline: "2099-01-01",
        action: "submit",
        response: "submit",
        type: INVITE_TO_X.APPLY,
      }
      await recordResponse(token, record)
      expect(post).toHaveBeenCalled()
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

  describe("snapshotEnv", () => {
    it("captures passive browser signals used to classify ambiguous clicks", () => {
      const env = snapshotEnv()
      expect(env).toEqual(
        expect.objectContaining({
          webdriver: expect.any(Boolean),
          ua: expect.any(String),
          touch: expect.any(Number),
          coarse: expect.any(Boolean),
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

      expect(() => snapshotEnv()).not.toThrow()
      expect(snapshotEnv().ua).toBe("")
      // Other fields still populate normally.
      expect(snapshotEnv().screen).toMatch(/\d+x\d+@/)

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

      const result = beaconHumanVerifiedClick({ ...humanRecord, trigger: "teardown" })

      expect(result).toBe(true)
      expect(sendBeacon).toHaveBeenCalledWith(
        "/api/v1/next-steps/log-human-verified",
        expect.any(Blob)
      )
    })

    it("returns false when sendBeacon is unavailable", () => {
      expect(beaconHumanVerifiedClick({ ...humanRecord, trigger: "teardown" })).toBe(false)
    })
  })
})
