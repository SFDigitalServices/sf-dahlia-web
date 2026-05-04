import { post } from "../../api/apiService"
import { recordResponse } from "../../api/inviteToApiService"
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
})
