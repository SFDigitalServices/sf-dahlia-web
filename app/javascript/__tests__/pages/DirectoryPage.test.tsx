import {
  getListingImageCardStatuses,
  getNumberString,
  getRangeString,
  getRentRangeString,
  getRentSubText,
  getTableHeader,
  showWaitlist,
} from "../../pages/ListingDirectory/DirectoryHelpers"
import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"

describe("<DirectoryPage />", () => {
  it("getListingImageCardStatuses renders as open application", () => {
    const testListing = {
      Application_Due_Date: "2100-10-30T00:00:00.000+0000",
      Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
      Publish_Lottery_Results: false,
    }
    expect(getListingImageCardStatuses(testListing as RailsRentalListing)).toStrictEqual([
      { status: 0, content: "Application Deadline: October 30, 2100" },
    ])
  })

  it("getListingImageCardStatuses renders as upcoming lottery", () => {
    const testListing = {
      Application_Due_Date: "2000-10-30T00:00:00.000+0000",
      Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
      Publish_Lottery_Results: false,
    }
    expect(getListingImageCardStatuses(testListing as RailsRentalListing)).toStrictEqual([
      { status: 1, content: "Applications Closed: October 30, 2000", hideIcon: true },
      { status: 3, content: "Lottery Results Posted: October 31, 2100", hideIcon: true },
    ])
  })

  it("getListingImageCardStatuses renders as results posted", () => {
    const testListing = {
      Application_Due_Date: "2000-10-30T00:00:00.000+0000",
      Lottery_Results_Date: "2000-10-31T00:00:00.000+0000",
      Publish_Lottery_Results: true,
      Lottery_Status: "Lottery Complete",
    }
    expect(getListingImageCardStatuses(testListing as RailsRentalListing)).toStrictEqual([
      { status: 3, content: "Lottery Results Posted: October 31, 2000", hideIcon: true },
    ])
  })

  it("getNumberString adds commas where appropriate", () => {
    expect(getNumberString(100000)).toBe("100,000")
    expect(getNumberString(10000)).toBe("10,000")
    expect(getNumberString(1000)).toBe("1,000")
    expect(getNumberString(100)).toBe("100")
  })

  describe("getRangeString", () => {
    it("returns range when different mix and max", () => {
      expect(getRangeString(10, 20)).toBe("10 to 20")
    })

    it("returns constant when same min and max", () => {
      expect(getRangeString(10, 10, "suffix", "prefix")).toBe("prefix10suffix")
    })

    it("adds prefix and suffix where appropriate", () => {
      expect(getRangeString(10, 20, "suffix", "prefix")).toBe("prefix10 to prefix20suffix")
      expect(getRangeString(10, 20, " per month", "$")).toBe("$10 to $20 per month")
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
})
