import React from "react"

import DirectoryPage, {
  getListingImageCardStatuses,
  getNumberString,
  getRangeString,
  getRentRangeString,
  getTableHeader,
} from "../../pages/DirectoryPage"
import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"
import { renderAndLoadAsync } from "../__util__/renderUtils"

describe("<DirectoryPage />", () => {
  it("renders successfully", async () => {
    const { getByText } = await renderAndLoadAsync(<DirectoryPage assetPaths={{}} isRental />)

    expect(getByText("DAHLIA: San Francisco Housing Portal is a project of the")).not.toBeNull()
  })

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

  it("getRangeString returns range when different mix and max", () => {
    expect(getRangeString(10, 20)).toBe("10 to 20")
  })

  it("getRangeString returns constant when same min and max", () => {
    expect(getRangeString(10, 10, "suffix", "prefix")).toBe("prefix10suffix")
  })

  it("getRangeString adds prefix and suffix where appropriate", () => {
    expect(getRangeString(10, 20, "suffix", "prefix")).toBe("prefix10 to prefix20suffix")
    expect(getRangeString(10, 20, " per month", "$")).toBe("$10 to $20 per month")
  })

  it("getRentRangeString returns rent if exists", () => {
    const testUnitSummaryRange = {
      minMonthlyRent: 100,
      maxMonthlyRent: 200,
      minPercentIncome: 10,
      maxPercentIncome: 20,
    }
    expect(getRentRangeString(testUnitSummaryRange as RailsRentalUnitSummary)).toBe(
      "$100 to $200 per month"
    )
    const testUnitSummaryConstant = {
      maxMonthlyRent: 200,
      minPercentIncome: 10,
      maxPercentIncome: 20,
    }
    expect(getRentRangeString(testUnitSummaryConstant as RailsRentalUnitSummary)).toBe(
      "$200 per month"
    )
  })

  it("getRentRangeString returns income if rent does not exist", () => {
    const testUnitSummaryRange = {
      minPercentIncome: 10,
      maxPercentIncome: 20,
    }
    expect(getRentRangeString(testUnitSummaryRange as RailsRentalUnitSummary)).toBe(
      "10 to 20% income"
    )
    const testUnitSummaryConstant = {
      minPercentIncome: 10,
    }
    expect(getRentRangeString(testUnitSummaryConstant as RailsRentalUnitSummary)).toBe("10% income")
  })

  it("getTableHeader with units reads Available", () => {
    const testListing = {
      Units_Available: 1,
    }
    expect(getTableHeader(testListing as RailsRentalListing)).toBe("Available Units")
  })

  it("getTableHeader with no units and waitlist reads Open Waitlist", () => {
    const testListing = {
      Units_Available: 0,
      hasWaitlist: true,
    }
    expect(getTableHeader(testListing as RailsRentalListing)).toBe("Open Waitlist")
  })

  it("getTableHeader with units and waitlist reads Available Units & Open Waitlist", () => {
    const testListing = {
      Units_Available: 1,
      hasWaitlist: true,
    }
    expect(getTableHeader(testListing as RailsRentalListing)).toBe(
      "Available Units & Open Waitlist"
    )
  })
})
