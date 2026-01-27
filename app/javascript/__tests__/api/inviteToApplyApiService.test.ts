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
        applicationNumber: "a0o123",
        deadline: "2099-01-01",
        response: "submit",
      }
      await recordResponse(record)
      expect(post).toHaveBeenCalled()
    })
  })
})
