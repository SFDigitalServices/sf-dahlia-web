import { post } from "../../api/apiService"
import { recordResponse } from "../../api/inviteToApplyApiService"

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
}))

describe("inviteToApplyApiService", () => {
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
        type: "I2A",
      }
      await recordResponse(record)
      expect(post).toHaveBeenCalled()
    })
  })
})
