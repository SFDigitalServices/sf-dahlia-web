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
      const record = {
        listingId: "a0w123",
        appId: "a0o123",
        applicationNumber: "12345",
        deadline: "2099-01-01",
        action: "submit",
        response: "submit",
        type: INVITE_TO_X.APPLY,
      }
      await recordResponse(record)
      expect(post).toHaveBeenCalled()
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
