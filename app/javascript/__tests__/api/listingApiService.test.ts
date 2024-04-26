import { get } from "../../api/apiService"

import { lotteryRanking } from "../../api/apiEndpoints"

import { getLotteryResults } from "../../api/listingApiService"

jest.mock("../../api/apiService", () => ({
  get: jest.fn(),
}))

describe("listingApiService", () => {
  describe("getLotteryResults", () => {
    const listingId = "test-listing-id"
    const lotteryId = "test-lottery-id"
    const url = lotteryRanking(listingId, lotteryId)

    it("calls apiService get", async () => {
      ;(get as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
      await getLotteryResults(listingId, lotteryId)
      expect(get).toHaveBeenCalledWith(url)
    })

    it("returns null when apiService get throws an error", async () => {
      ;(get as jest.Mock).mockRejectedValue(new Error("test error"))
      const results = await getLotteryResults(listingId, lotteryId)
      expect(results).toBeNull()
    })
  })
})
