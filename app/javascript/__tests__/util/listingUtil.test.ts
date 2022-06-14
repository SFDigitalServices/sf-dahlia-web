import {
  getListingAddressString,
  isHabitatListing,
  isLotteryComplete,
  isOpen,
  isRental,
  isSale,
} from "../../util/listingUtil"
import { openSaleListing } from "../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../data/RailsRentalListing/listing-rental-closed"
import { lotteryCompleteRentalListing } from "../data/RailsRentalListing/listing-rental-lottery-complete"
import { habitatListing } from "../data/RailsSaleListing/listing-sale-habitat"

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

  describe("getListingAddressString", () => {
    it("should build the address string when all fields are present", () => {
      expect(getListingAddressString(openSaleListing)).toBe(
        "1 South Van Ness Ave, San Francisco, CA 94103"
      )
    })

    it("should return empty string when an address field is missing", () => {
      const testListing = { ...openSaleListing }
      testListing.Building_Street_Address = ""

      expect(getListingAddressString(testListing)).toBe("")
    })
  })

  describe("isHabitatListing", () => {
    it("should return false when listing is not a habitat listing", () => {
      expect(isHabitatListing(closedRentalListing)).toBe(false)
    })

    it("should return true when listing is a habitat listing", () => {
      expect(isHabitatListing(habitatListing)).toBe(true)
    })
  })
})
