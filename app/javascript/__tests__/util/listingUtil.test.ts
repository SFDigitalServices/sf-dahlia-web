import {
  getListingAddressString,
  isHabitatListing,
  isLotteryComplete,
  isOpen,
  isRental,
  isSale,
  getEventTimeString,
  paperApplicationURLs,
  listingHasOnlySROUnits,
  listingHasSROUnits,
  isPluralSRO,
} from "../../util/listingUtil"
import { openSaleListing } from "../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../data/RailsRentalListing/listing-rental-closed"
import { lotteryCompleteRentalListing } from "../data/RailsRentalListing/listing-rental-lottery-complete"
import { habitatListing } from "../data/RailsSaleListing/listing-sale-habitat"
import { sroRentalListing } from "../data/RailsRentalListing/listing-rental-sro"

describe("listingUtil", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

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

  describe("listingHasOnlySROUnits", () => {
    it("should return false when not all units are SRO", () => {
      expect(listingHasOnlySROUnits(closedRentalListing)).toBe(false)
    })

    it("should return true when all units are SRO", () => {
      expect(listingHasOnlySROUnits(sroRentalListing)).toBe(true)
    })
  })

  describe("listingHasSROUnits", () => {
    it("should return false when listing has no SRO units", () => {
      expect(listingHasSROUnits(closedRentalListing)).toBe(false)
    })

    it("should return true when listing has SRO units", () => {
      expect(listingHasSROUnits(sroRentalListing)).toBe(true)
    })
  })

  describe("isPluralSRO", () => {
    it("should return false when listing is not in the list of plural SROs", () => {
      expect(isPluralSRO("Merry Go Round Shared Housing", sroRentalListing)).toBe(false)
    })

    it("should return true when listing is in the list of plural SROs", () => {
      process.env.SRO_PLURAL_LISTINGS = JSON.parse(process.env.SRO_PLURAL_LISTINGS)
      const listing = { ...sroRentalListing, Id: "a0W0P00000F7t4uUAB" }
      expect(isPluralSRO("Merry Go Round Shared Housing", listing)).toBe(true)
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

  describe("getEventTimeString", () => {
    it("should return 5:00PM - 7:00PM when event has start and end time", () => {
      expect(getEventTimeString(lotteryCompleteRentalListing.Open_Houses[0])).toBe(
        "5:00PM - 7:00PM"
      )
    })

    it("should return only start time with no end time", () => {
      const event = { ...lotteryCompleteRentalListing.Open_Houses[0], End_Time: "" }
      expect(getEventTimeString(event)).toBe("5:00PM")
    })

    it("should return empty string with no date", () => {
      const event = { ...lotteryCompleteRentalListing.Open_Houses[0], Start_Time: "" }
      expect(getEventTimeString(event)).toBe("")
    })
  })
  describe("paperApplicationURLs", () => {
    it("should build rental URLs correctly", () => {
      expect(paperApplicationURLs(true)).toStrictEqual([
        {
          languageString: "English",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Rental%20Paper%20Applications/English%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf",
        },
        {
          languageString: "Español",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Rental%20Paper%20Applications/Spanish%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf",
        },
        {
          languageString: "中文",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Rental%20Paper%20Applications/Chinese%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf",
        },
        {
          languageString: "Filipino",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Rental%20Paper%20Applications/Tagalog%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf",
        },
      ])
    })

    it("should build sale URLs correctly", () => {
      expect(paperApplicationURLs(false)).toStrictEqual([
        {
          languageString: "English",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Ownership%20Paper%20Applications/English%20BMR%20Own%20Short%20Form%20Paper%20App.pdf",
        },
        {
          languageString: "Español",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Ownership%20Paper%20Applications/Spanish%20BMR%20Own%20Short%20Form%20Paper%20App.pdf",
        },
        {
          languageString: "中文",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Ownership%20Paper%20Applications/Chinese%20BMR%20Own%20Short%20Form%20Paper%20App.pdf",
        },
        {
          languageString: "Filipino",
          fileURL:
            "https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Ownership%20Paper%20Applications/Tagalog%20BMR%20Own%20Short%20Form%20Paper%20App.pdf",
        },
      ])
    })
  })
})
