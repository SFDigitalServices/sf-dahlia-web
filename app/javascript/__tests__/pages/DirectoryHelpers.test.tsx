import {
  getCurrencyString,
  getRangeString,
  getNumberString,
  getRentRangeString,
  getRentSubText,
  getTableHeader,
  showWaitlist,
  getPriorityTypes,
  sortListings,
} from "../../modules/listings/DirectoryHelpers"
import { ListingState } from "../../modules/listings/ListingState"
import { getFcfsSalesListingState } from "../../util/listingUtil"
import type RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import type RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"
import { openSaleListing } from "../data/RailsSaleListing/listing-sale-open"
import { fcfsSaleListing } from "../data/RailsSaleListing/listing-sale-fcfs"
import { closedFcfsSaleListing } from "../data/RailsSaleListing/listing-sale-fcfs-closed"
import { notYetOpenSaleFcfsListing } from "../data/RailsSaleListing/listing-sale-fcfs-not-yet-open"

describe("DirectoryHelpers", () => {
  describe("getCurrencyString", () => {
    it("adds commas where appropriate", () => {
      expect(getCurrencyString(100000)).toBe("$100,000")
      expect(getCurrencyString(10000)).toBe("$10,000")
      expect(getCurrencyString(1000)).toBe("$1,000")
      expect(getCurrencyString(100)).toBe("$100")
    })
    it("does not display decimal values if they're empty", () => {
      // eslint-disable-next-line unicorn/no-zero-fractions
      expect(getCurrencyString(1.0)).toBe("$1")
      // eslint-disable-next-line unicorn/no-zero-fractions, prettier/prettier
      expect(getCurrencyString(1000.0)).toBe("$1,000")
    })
    it("displays two digits after the decimal if not empty", () => {
      expect(getCurrencyString(1.01)).toBe("$1.01")
      expect(getCurrencyString(1.9)).toBe("$1.90")
    })
    it("handles null, undefined, 0s as expected", () => {
      expect(getCurrencyString(0)).toBe("$0")
      expect(getCurrencyString(null)).toBeNull()
      expect(getCurrencyString(undefined)).toBeNull()
    })
  })
  describe("getNumberString", () => {
    it("defaults to not adding $", () => {
      expect(getNumberString(1)).toBe("1")
    })
    it("formats as currency when expected", () => {
      expect(getNumberString(1, true)).toBe("$1")
    })
    it("adds commas where appropriate", () => {
      expect(getNumberString(100000)).toBe("100,000")
      expect(getNumberString(10000)).toBe("10,000")
      expect(getNumberString(1000)).toBe("1,000")
      expect(getNumberString(100)).toBe("100")
    })
    it("handles null, undefined, 0s as expected", () => {
      expect(getNumberString(0)).toBe("0")
      expect(getNumberString(null)).toBeNull()
      expect(getNumberString(undefined)).toBeNull()
    })
  })

  describe("getRangeString", () => {
    it("returns range when different mix and max", () => {
      expect(getRangeString(10, 20)).toBe("10 to 20")
    })
    it("returns constant when same min and max", () => {
      expect(getRangeString(10, 10)).toBe("10")
    })
    it("includes 0 as min value if provided", () => {
      expect(getRangeString(0, 20, false)).toBe("up to 20")
      expect(getRangeString(0, 20, true)).toBe("up to $20")
      expect(getRangeString(0, 0, false)).toBe("0")
    })
    it("formats ranges as currency when expected", () => {
      expect(getRangeString(10, 20, false)).toBe("10 to 20")
      expect(getRangeString(10.1, 20, false)).toBe("10.1 to 20")
      expect(getRangeString(10, 20, true)).toBe("$10 to $20")
      expect(getRangeString(10.1, 20, true)).toBe("$10.10 to $20")
      expect(getRangeString(10, 10, true)).toBe("$10")
    })
    it("adds suffix where appropriate", () => {
      expect(getRangeString(10, 20, false, "suffix")).toBe("10 to 20suffix")
      expect(getRangeString(10, 20, true, "suffix")).toBe("$10 to $20suffix")
      expect(getRangeString(10, 20, true, " per month")).toBe("$10 to $20 per month")
    })
    it("handles undefined and null values as expected", () => {
      expect(getRangeString(undefined, undefined)).toBeNull()
      expect(getRangeString(null, null)).toBeNull()
      expect(getRangeString(undefined, 20)).toBe("20")
      expect(getRangeString(null, 20)).toBe("20")
      expect(getRangeString(null, 0)).toBe("0")
      expect(getRangeString(0, null)).toBe("0")
      expect(getRangeString(undefined, 0)).toBe("0")
      expect(getRangeString(0, undefined)).toBe("0")
      expect(getRangeString(20, undefined)).toBe("20")
      expect(getRangeString(20, null)).toBe("20")
    })
  })
  describe("getRentRangeString", () => {
    it("returns rent if exists", () => {
      const testUnitSummaryRange = {
        minMonthlyRent: 100,
        maxMonthlyRent: 200,
        minPercentIncome: 10,
        maxPercentIncome: 20,
      }
      expect(getRentRangeString(testUnitSummaryRange as RailsRentalUnitSummary)).toBe(
        "$100 to $200"
      )
      const testUnitSummaryConstant = {
        maxMonthlyRent: 200,
        minPercentIncome: 10,
        maxPercentIncome: 20,
      }
      expect(getRentRangeString(testUnitSummaryConstant as RailsRentalUnitSummary)).toBe("$200")
    })

    it("returns income if rent does not exist", () => {
      const testUnitSummaryRange = {
        minPercentIncome: 10,
        maxPercentIncome: 20,
      }
      expect(getRentRangeString(testUnitSummaryRange as RailsRentalUnitSummary)).toBe("10 to 20%")
      const testUnitSummaryConstant = {
        minPercentIncome: 10,
      }
      expect(getRentRangeString(testUnitSummaryConstant as RailsRentalUnitSummary)).toBe("10%")
    })
  })

  describe("getRentSubtext", () => {
    it("returns 'per month' if rent is a dollar amount", () => {
      const testSummaryMinOnly = {
        minMonthlyRent: 100,
      }
      expect(getRentSubText(testSummaryMinOnly as RailsRentalUnitSummary)).toBe("per month")

      const testSummaryRange = {
        minMonthlyRent: 100,
        maxMonthlyRent: 100,
      }
      expect(getRentSubText(testSummaryRange as RailsRentalUnitSummary)).toBe("per month")
    })

    it("returns 'income' if rent is a percent amount", () => {
      const testSummaryMinOnly = {
        minPercentIncome: 100,
      }
      expect(getRentSubText(testSummaryMinOnly as RailsRentalUnitSummary)).toBe("income")

      const testSummaryRange = {
        minPercentIncome: 100,
        maxPercentIncome: 100,
      }
      expect(getRentSubText(testSummaryRange as RailsRentalUnitSummary)).toBe("income")
    })

    it("returns null if all data is missing", () => {
      const emptySummary = {}
      expect(getRentSubText(emptySummary as RailsRentalUnitSummary)).toBeNull()
    })
  })

  describe("showWaitlist", () => {
    it("returns true if no units are available and the listing has a waitlist", () => {
      const testListing = {
        hasWaitlist: true,
      }
      const testSummary = {
        availability: 0,
      }
      expect(
        showWaitlist(testListing as RailsRentalListing, testSummary as RailsRentalUnitSummary)
      ).toBe(true)
    })

    it("returns false if units are available or the listing doesn't have a waitlist", () => {
      const testListingWithWaitlist = {
        hasWaitlist: true,
      }
      const testSummaryWithAvailability = {
        availability: 1,
      }
      expect(
        showWaitlist(
          testListingWithWaitlist as RailsRentalListing,
          testSummaryWithAvailability as RailsRentalUnitSummary
        )
      ).toBe(false)

      const testListingWithoutWaitlist = {
        hasWaitlist: false,
      }
      const testSummaryWithoutAvailability = {
        availability: 0,
      }
      expect(
        showWaitlist(
          testListingWithoutWaitlist as RailsRentalListing,
          testSummaryWithoutAvailability as RailsRentalUnitSummary
        )
      ).toBe(false)
    })
  })

  describe("getTableHeader", () => {
    it("with units reads Available", () => {
      const testListing = {
        Units_Available: 1,
      }
      expect(getTableHeader(testListing as RailsRentalListing)).toBe("Available Units")
    })

    it("with no units and waitlist reads Open Waitlist", () => {
      const testListing = {
        Units_Available: 0,
        hasWaitlist: true,
      }
      expect(getTableHeader(testListing as RailsRentalListing)).toBe("Open Waitlist")
    })

    it("with units and waitlist reads Available Units & Open Waitlist", () => {
      const testListing = {
        Units_Available: 1,
        hasWaitlist: true,
      }
      expect(getTableHeader(testListing as RailsRentalListing)).toBe(
        "Available Units & Open Waitlist"
      )
    })
  })
  describe("getTableSubHeader", () => {
    it("returns null with listing lacking prioritiesDescriptor", () => {
      const testListing = {}
      expect(getPriorityTypes(testListing as RailsRentalListing)).toBeNull()
    })

    it("returns null with listing lacking priorities length", () => {
      const testListing = { prioritiesDescriptor: [] }
      expect(getPriorityTypes(testListing as RailsRentalListing)).toBeNull()
    })

    it("correctly parses Vision impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Vision impairments",
          },
        ],
      }

      expect(getPriorityTypes(testListing as RailsRentalListing)).toEqual(["Vision Impairments"])
    })

    it("correctly parses Hearing impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Hearing impairments",
          },
        ],
      }

      expect(getPriorityTypes(testListing as RailsRentalListing)).toEqual(["Hearing Impairments"])
    })

    it("correctly parses Hearing/Vision impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Hearing/Vision impairments",
          },
        ],
      }

      expect(getPriorityTypes(testListing as RailsRentalListing)).toEqual([
        "Vision and/or Hearing Impairments",
      ])
    })

    it("correctly parses Mobility/hearing/vision impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Mobility/Hearing/Vision impairments",
          },
        ],
      }

      expect(getPriorityTypes(testListing as RailsRentalListing)).toEqual([
        "Mobility, Hearing and/or Vision Impairments",
      ])
    })

    it("correctly parses Mobility impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Mobility impairments",
          },
        ],
      }

      expect(getPriorityTypes(testListing as RailsRentalListing)).toEqual(["Mobility Impairments"])
    })

    it("correctly parses no matches", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "test",
          },
        ],
      }

      expect(getPriorityTypes(testListing as RailsRentalListing)).toEqual(["test"])
    })
  })
  describe("sortListings", () => {
    let fcfsSaleListingEarlierDate: RailsSaleListing
    let fcfsSaleListingLaterDate: RailsSaleListing
    beforeEach(() => {
      // modify application start date so that it will be considered an open listing
      fcfsSaleListingEarlierDate = JSON.parse(JSON.stringify(fcfsSaleListing))
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      fcfsSaleListingEarlierDate.Application_Start_Date_Time = yesterday.toISOString()
      // another open listing, 1 month later
      fcfsSaleListingLaterDate = JSON.parse(JSON.stringify(fcfsSaleListingEarlierDate))
      fcfsSaleListingLaterDate.Application_Due_Date = "2050-02-01T01:00:00.000+0000"
    })

    it("correctly puts listings in proper buckets", () => {
      const mockSetMatch = jest.fn()
      const { open, upcoming, results, additional, fcfs } = sortListings(
        [openSaleListing, fcfsSaleListing, closedFcfsSaleListing, notYetOpenSaleFcfsListing],
        null,
        mockSetMatch
      )
      expect(open).toHaveLength(1)
      expect(upcoming).toHaveLength(0)
      expect(results).toHaveLength(0)
      expect(additional).toHaveLength(0)
      expect(fcfs).toHaveLength(2)
    })

    it("correctly sorts fcfs by due date", () => {
      const { fcfs } = sortListings(
        [notYetOpenSaleFcfsListing, fcfsSaleListingLaterDate, fcfsSaleListingEarlierDate],
        null,
        jest.fn()
      )
      expect(fcfs).toHaveLength(3)
      // two open fcfs listings are sorted by date
      expect(new Date(fcfs[1].Application_Due_Date).getTime()).toBeGreaterThan(
        new Date(fcfs[0].Application_Due_Date).getTime()
      )
      // not yet open fcfs listing is at the end
      expect(getFcfsSalesListingState(fcfs[2])).toEqual(ListingState.NotYetOpen)
    })

    it("correctly sorts fcfs by state", () => {
      const { fcfs } = sortListings(
        [notYetOpenSaleFcfsListing, fcfsSaleListingEarlierDate],
        null,
        jest.fn()
      )
      expect(fcfs).toHaveLength(2)
      // open listings are at the beginning
      expect(getFcfsSalesListingState(fcfs[0])).toEqual(ListingState.Open)
      // not yet open fcfs listings are at the end
      expect(getFcfsSalesListingState(fcfs[1])).toEqual(ListingState.NotYetOpen)
    })
  })
})
