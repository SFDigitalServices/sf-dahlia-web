import { isLotteryComplete, isOpen, isRental, isSale } from "../../util/listingUtil"
import { openSaleListing } from "../data/listing-sale-open"
import { closedRentalListing } from "../data/listing-rental-closed"
import { lotteryCompleteRentalListing } from "../data/listing-rental-lottery-complete"

describe("listingUtil", () => {
  describe("isLotteryComplete", () => {
    it("should return false when listing is open", () => {
      expect(isLotteryComplete(openSaleListing)).toBe(false)
    })

    it("should return false when lottery status is 'Not Yet Run'", () => {
      expect(isLotteryComplete(closedRentalListing)).toBe(false)
    })
  })

  describe("isOpen", () => {
    it("should return false when application due date has passed", () => {
      expect(isOpen(closedRentalListing)).toBe(false)
    })

    it("should return true when application due date has not passed", () => {
      expect(isOpen(openSaleListing)).toBe(true)
    })
  })

  describe("isRental", () => {
    it("should return false when listing is not a rental", () => {
      expect(isRental(openSaleListing)).toBe(false)
    })

    it("should return true when listing is a rental", () => {
      expect(isRental(lotteryCompleteRentalListing)).toBe(true)
    })
  })

  describe("isSale", () => {
    it("should return false when listing is not a sale", () => {
      expect(isSale(closedRentalListing)).toBe(false)
    })

    it("should return true when listing is a sale", () => {
      expect(isSale(openSaleListing)).toBe(true)
    })
  })
})
