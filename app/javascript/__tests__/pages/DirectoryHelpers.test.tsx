import {
  getCurrencyString,
  getRangeString,
  getNumberString,
  getRentRangeString,
  getRentSubText,
  getTableHeader,
  showWaitlist,
  getTableSubHeader,
} from "../../modules/listings/DirectoryHelpers"
import { getListingImageCardStatuses } from "../../modules/listings/SharedHelpers"
import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import type RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"

describe("DirectoryHelpers", () => {
  describe("getListingImageCardStatuses", () => {
    describe("with no eligibility filters", () => {
      it("renders as open application", () => {
        const testListing = {
          Application_Due_Date: "2100-10-30T00:00:00.000+0000",
          Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
          Publish_Lottery_Results: false,
        }
        expect(
          getListingImageCardStatuses(testListing as RailsRentalListing, false)
        ).toStrictEqual([{ status: 0, content: "Application Deadline: October 30, 2100" }])
      })

      it("renders as upcoming lottery", () => {
        const testListing = {
          Application_Due_Date: "2000-10-30T00:00:00.000+0000",
          Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
          Publish_Lottery_Results: false,
        }
        expect(getListingImageCardStatuses(testListing as RailsRentalListing, false)).toStrictEqual(
          [
            { status: 1, content: "Applications Closed: October 30, 2000", hideIcon: true },
            { status: 3, content: "Lottery Results Posted: October 31, 2100", hideIcon: true },
          ]
        )
      })
      it("renders as results posted", () => {
        const testListing = {
          Application_Due_Date: "2000-10-30T00:00:00.000+0000",
          Lottery_Results_Date: "2000-10-31T00:00:00.000+0000",
          Publish_Lottery_Results: true,
          Lottery_Status: "Lottery Complete",
        }
        expect(
          getListingImageCardStatuses(testListing as RailsRentalListing, false)
        ).toStrictEqual([
          { status: 3, content: "Lottery Results Posted: October 31, 2000", hideIcon: true },
        ])
      })
      it("does not render listing as matched", () => {
        const testListing = {
          Application_Due_Date: "2100-10-30T00:00:00.000+0000",
          Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
          Publish_Lottery_Results: false,
          Does_Match: true,
        }
        expect(
          getListingImageCardStatuses(testListing as RailsRentalListing, false)
        ).toStrictEqual([{ status: 0, content: "Application Deadline: October 30, 2100" }])
      })
    })
    describe("with eligibility filters", () => {
      it("renders a matched open listing as 'matched'", () => {
        const testListing = {
          Application_Due_Date: "2100-10-30T00:00:00.000+0000",
          Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
          Publish_Lottery_Results: false,
          Does_Match: true,
        }
        expect(getListingImageCardStatuses(testListing as RailsRentalListing, true)).toStrictEqual([
          { status: 4, iconType: "check", content: "Matched", hideIcon: false },
        ])
      })
      it("renders a non-match open listing as 'not a match'", () => {
        const testListing = {
          Application_Due_Date: "2100-10-30T00:00:00.000+0000",
          Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
          Publish_Lottery_Results: false,
          Does_Match: false,
        }
        expect(getListingImageCardStatuses(testListing as RailsRentalListing, true)).toStrictEqual([
          { status: 3, hideIcon: true, content: "Not a Match" },
        ])
      })
      it("does not affect listings with closed applications", () => {
        const testListing = {
          Application_Due_Date: "2000-10-30T00:00:00.000+0000",
          Lottery_Results_Date: "2100-10-31T00:00:00.000+0000",
          Publish_Lottery_Results: false,
        }
        expect(getListingImageCardStatuses(testListing as RailsRentalListing, true)).toStrictEqual([
          { status: 1, content: "Applications Closed: October 30, 2000", hideIcon: true },
          { status: 3, content: "Lottery Results Posted: October 31, 2100", hideIcon: true },
        ])
      })
    })
  })
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
      expect(getRangeString(0, 20, false)).toBe("0 to 20")
      expect(getRangeString(0, 20, true)).toBe("$0 to $20")
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
      expect(getTableSubHeader(testListing as RailsRentalListing)).toBeNull()
    })

    it("returns null with listing lacking priorities length", () => {
      const testListing = { prioritiesDescriptor: [] }
      expect(getTableSubHeader(testListing as RailsRentalListing)).toBeNull()
    })

    it("correctly parses Vision impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Vision impairments",
          },
        ],
      }

      expect(getTableSubHeader(testListing as RailsRentalListing)).toBe(
        "Includes Priority Units for Vision Impairments"
      )
    })

    it("correctly parses Hearing impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Hearing impairments",
          },
        ],
      }

      expect(getTableSubHeader(testListing as RailsRentalListing)).toBe(
        "Includes Priority Units for Hearing Impairments"
      )
    })

    it("correctly parses Hearing/Vision impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Hearing/Vision impairments",
          },
        ],
      }

      expect(getTableSubHeader(testListing as RailsRentalListing)).toBe(
        "Includes Priority Units for Vision and/or Hearing Impairments"
      )
    })

    it("correctly parses Mobility/hearing/vision impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Mobility/hearing/vision impairments",
          },
        ],
      }

      expect(getTableSubHeader(testListing as RailsRentalListing)).toBe(
        "Includes Priority Units for Mobility, Hearing and/or Vision Impairments"
      )
    })

    it("correctly parses Mobility impairments", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "Mobility impairments",
          },
        ],
      }

      expect(getTableSubHeader(testListing as RailsRentalListing)).toBe(
        "Includes Priority Units for Mobility Impairments"
      )
    })

    it("correctly parses no matches", () => {
      const testListing = {
        prioritiesDescriptor: [
          {
            name: "test",
          },
        ],
      }

      expect(getTableSubHeader(testListing as RailsRentalListing)).toBe(
        "Includes Priority Units for test"
      )
    })
  })
})
