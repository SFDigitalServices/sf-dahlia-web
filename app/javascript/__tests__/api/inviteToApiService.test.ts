import { post } from "../../api/apiService"
import { recordResponse, logHumanVerifiedClick } from "../../api/inviteToApiService"
import { INVITE_TO_X } from "../../modules/constants"

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
}))

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
      const record = {
        listingId: "a0w123",
        appId: "a0o123",
        deadline: "2099-01-01",
        act: "yes",
        type: INVITE_TO_X.APPLY,
        trigger: "interaction",
        elapsedMs: 1234,
      }
      await logHumanVerifiedClick(record)
      expect(post).toHaveBeenCalledWith("/api/v1/next-steps/log-human-verified", { record })
    })
  })
})
