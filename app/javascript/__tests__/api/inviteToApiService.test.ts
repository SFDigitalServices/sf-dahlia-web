import { post } from "../../api/apiService"
import { recordResponse } from "../../api/inviteToApiService"

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
}))

describe("inviteToApiService", () => {
  describe("recordResponse", () => {
    it("calls apiService post", async () => {
      post as jest.Mock
      const record = {
        appId: "a0o123",
        deadline: "2099-01-01",
        action: "submit",
      }
      await recordResponse(record)
      expect(post).toHaveBeenCalled()
    })
  })
})
