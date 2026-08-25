import { post } from "../../api/apiService"
import {
  recordResponse,
  logHumanVerifiedClick,
  beaconHumanVerifiedClick,
  HumanVerifiedRecord,
} from "../../api/inviteToApiService"
import { snapshotBrowser } from "../../util/browserSnapshotUtil"
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
