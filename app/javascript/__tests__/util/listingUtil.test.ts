import {
  getListingAddressString,
  isHabitatListing,
  isLotteryComplete,
  showLotteryResultsPDFonly,
  isOpen,
  isRental,
  isSale,
  getEventTimeString,
  paperApplicationURLs,
  listingHasOnlySROUnits,
  listingHasSROUnits,
  isPluralSRO,
  getAbsoluteMinAndMaxIncome,
  buildOccupanciesArray,
  matchSharedUnitFields,
  addUnitsWithEachOccupancy,
  deriveIncomeFromAmiCharts,
  buildAmiArray,
  groupAndSortUnitsByOccupancy,
  getAmiChartDataFromUnits,
  getPriorityTypeText,
  getTagContent,
  listingHasVeteransPreference,
  preferenceNameHasVeteran,
  isFcfsListing,
} from "../../util/listingUtil"
import { openSaleListing } from "../data/RailsSaleListing/listing-sale-open"
import { saleEducatorListing } from "../data/RailsSaleListing/listing-sale-educator"
import { saleListingReservedAndCustom } from "../data/RailsSaleListing/listing-sale-reserved-and-custom"
import { rentalVeteranPreferenceListing } from "../data/RailsRentalListing/listing-rental-veteran-preference"
import { closedRentalListing } from "../data/RailsRentalListing/listing-rental-closed"
import { lotteryCompleteRentalListing } from "../data/RailsRentalListing/listing-rental-lottery-complete"
import { rentalEducatorListing1complete } from "../data/RailsRentalListing/listing-rental-educator-lottery-complete"
import { habitatListing } from "../data/RailsSaleListing/listing-sale-habitat"
import {
  sroRentalListing,
  pluralSroRentalListing,
} from "../data/RailsRentalListing/listing-rental-sro"
import { unitsWithOccupancyAndMaxIncome, units } from "../data/RailsListingUnits/listing-units"
import { amiCharts } from "../data/RailsAmiCharts/ami-charts"
import { groupedUnitsByOccupancy } from "../data/RailsListingUnits/grouped-units-by-occupancy"
import RailsUnit, {
  RailsUnitWithOccupancy,
  RailsUnitWithOccupancyAndMinMaxIncome,
} from "../../api/types/rails/listings/RailsUnit"
import { fcfsSaleListing } from "../data/RailsSaleListing/listing-sale-fcfs"
import { openRentalFcfsListing } from "../data/RailsRentalListing/listing-rental-fcfs"

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

    it("should return true when lottery status is complete foro Educator listings", () => {
      expect(isLotteryComplete(lotteryCompleteRentalListing)).toBe(true)
    })
  })

  describe("showLotteryResultsPDFonly", () => {
    it("should return false when lottery status is complete for non-Educator listings", () => {
      expect(showLotteryResultsPDFonly(lotteryCompleteRentalListing)).toBe(false)
    })

    it("should return true when lottery status is complete for Educator listings", () => {
      expect(showLotteryResultsPDFonly(rentalEducatorListing1complete)).toBe(true)
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
    it("should return false for a standard (single tenant) SROs", () => {
      expect(isPluralSRO(sroRentalListing)).toBe(false)
    })

    it("should return true for a plural SROs", () => {
      expect(isPluralSRO(pluralSroRentalListing)).toBe(true)
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

describe("deriveIncomeFromAmiCharts", () => {
  const occupancy = 3

  it("returns null if any argument is missing", () => {
    expect(deriveIncomeFromAmiCharts(undefined, occupancy, amiCharts)).toBeNull()
    expect(
      deriveIncomeFromAmiCharts(unitsWithOccupancyAndMaxIncome[0], undefined, amiCharts)
    ).toBeNull()
    expect(
      deriveIncomeFromAmiCharts(unitsWithOccupancyAndMaxIncome[0], occupancy, undefined)
    ).toBeNull()
  })

  it("returns null if no AMI chart matches the units AMI", () => {
    const wrongUnit = { ...unitsWithOccupancyAndMaxIncome[0], Max_AMI_for_Qualifying_Unit: 90 }
    expect(deriveIncomeFromAmiCharts(wrongUnit, occupancy, amiCharts)).toBeNull()
  })

  it("returns the monthly income for the given occupancy if found in the AMI chart", () => {
    expect(deriveIncomeFromAmiCharts(unitsWithOccupancyAndMaxIncome[0], occupancy, amiCharts)).toBe(
      6329
    )
  })

  it("returns null if the given occupancy is not found in the AMI chart", () => {
    const wrongOccupancy = 12
    expect(
      deriveIncomeFromAmiCharts(unitsWithOccupancyAndMaxIncome[0], wrongOccupancy, amiCharts)
    ).toBeNull()
  })
})

describe("addUnitsWithEachOccupancy", () => {
  it("should return an empty array when units is empty", () => {
    const units: Array<RailsUnit> = []
    const result = addUnitsWithEachOccupancy(units)
    expect(result).toEqual([])
  })

  it("should add occupancy property to each unit", () => {
    const unitsForOccupancyTest = [unitsWithOccupancyAndMaxIncome[0]]
    const result = addUnitsWithEachOccupancy(unitsForOccupancyTest)
    expect(result).toHaveLength(4)
    expect(result[0]).toHaveProperty("occupancy", 2)
    expect(result[1]).toHaveProperty("occupancy", 3)
    expect(result[2]).toHaveProperty("occupancy", 4)
    expect(result[3]).toHaveProperty("occupancy", 5)
  })
})

describe("buildAmiArray", () => {
  it("should return an empty array when units is empty", () => {
    const units: Array<RailsUnitWithOccupancyAndMinMaxIncome> = []
    const result = buildAmiArray(units)
    expect(result).toEqual([])
  })

  it("should return an array of unique Max_AMI_for_Qualifying_Unit values sorted in ascending order", () => {
    const result = buildAmiArray(unitsWithOccupancyAndMaxIncome)
    expect(result).toEqual([
      { min: 55, max: 82 },
      { min: 82, max: 109.8 },
    ])
  })
})

describe("getAbsoluteMinAndMaxIncome", () => {
  it("should return the correct min and max income when units is not empty", () => {
    const result = getAbsoluteMinAndMaxIncome(unitsWithOccupancyAndMaxIncome)
    expect(result).toEqual({ absoluteMaxIncome: 1500, absoluteMinIncome: 100 })
  })
})

describe("matchSharedUnitFields", () => {
  const unit1 = {
    ...unitsWithOccupancyAndMaxIncome[0],
    BMR_Rent_Monthly: 1000,
    Unit_Type: "1 bedroom",
    occupancy: 1,
    maxMonthlyIncomeNeeded: 5000,
    BMR_Rental_Minimum_Monthly_Income_Needed: 3000,
    Max_AMI_for_Qualifying_Unit: 80,
    Availability: 2,
  }
  const unit2 = {
    ...unitsWithOccupancyAndMaxIncome[0],
    BMR_Rent_Monthly: 1000,
    Unit_Type: "1 bedroom",
    occupancy: 1,
    maxMonthlyIncomeNeeded: 5000,
    BMR_Rental_Minimum_Monthly_Income_Needed: 3000,
    Max_AMI_for_Qualifying_Unit: 80,
    Availability: 3,
  }
  const unit3 = {
    ...unitsWithOccupancyAndMaxIncome[0],
    BMR_Rent_Monthly: 1200,
    Unit_Type: "2 bedroom",
    occupancy: 2,
    maxMonthlyIncomeNeeded: 6000,
    BMR_Rental_Minimum_Monthly_Income_Needed: 3500,
    Max_AMI_for_Qualifying_Unit: 100,
    Availability: 1,
  }

  it("should return the input array if there are no duplicate summaries", () => {
    const inputUnits = [unit1, unit3]
    const expectedOutput = inputUnits
    const actualOutput = matchSharedUnitFields(inputUnits)
    expect(actualOutput).toEqual(expectedOutput)
  })

  it("should combine Availability of units with identical summary fields", () => {
    const inputUnits = [unit1, unit2, unit3]
    const expectedOutput = [
      {
        ...unitsWithOccupancyAndMaxIncome[0],
        BMR_Rent_Monthly: 1000,
        Unit_Type: "1 bedroom",
        occupancy: 1,
        maxMonthlyIncomeNeeded: 5000,
        BMR_Rental_Minimum_Monthly_Income_Needed: 3000,
        Max_AMI_for_Qualifying_Unit: 80,
        Availability: 5,
      },
      {
        ...unitsWithOccupancyAndMaxIncome[0],
        BMR_Rent_Monthly: 1200,
        Unit_Type: "2 bedroom",
        occupancy: 2,
        maxMonthlyIncomeNeeded: 6000,
        BMR_Rental_Minimum_Monthly_Income_Needed: 3500,
        Max_AMI_for_Qualifying_Unit: 100,
        Availability: 1,
      },
    ]
    const actualOutput = matchSharedUnitFields(inputUnits)
    expect(actualOutput).toEqual(expectedOutput)
  })

  it("should handle an empty input array", () => {
    const inputUnits: Array<RailsUnitWithOccupancyAndMinMaxIncome> = []
    const expectedOutput = inputUnits
    const actualOutput = matchSharedUnitFields(inputUnits)
    expect(actualOutput).toEqual(expectedOutput)
  })
})

describe("buildOccupanciesArray", () => {
  const unit1 = {
    ...unitsWithOccupancyAndMaxIncome[0],
    BMR_Rent_Monthly: 1000,
    Unit_Type: "1 bedroom",
    occupancy: 1,
    maxMonthlyIncomeNeeded: 5000,
    BMR_Rental_Minimum_Monthly_Income_Needed: 3000,
    Max_AMI_for_Qualifying_Unit: 80,
    Availability: 2,
  }
  const unit2 = {
    ...unitsWithOccupancyAndMaxIncome[0],
    BMR_Rent_Monthly: 1200,
    Unit_Type: "2 bedroom",
    occupancy: 2,
    maxMonthlyIncomeNeeded: 6000,
    BMR_Rental_Minimum_Monthly_Income_Needed: 3500,
    Max_AMI_for_Qualifying_Unit: 100,
    Availability: 1,
  }
  const unit3 = {
    ...unitsWithOccupancyAndMaxIncome[0],
    BMR_Rent_Monthly: 1500,
    Unit_Type: "3 bedroom",
    occupancy: 3,
    maxMonthlyIncomeNeeded: 8000,
    BMR_Rental_Minimum_Monthly_Income_Needed: 4000,
    Max_AMI_for_Qualifying_Unit: 120,
    Availability: 3,
  }

  it("should return an array of unique occupancies sorted in ascending order", () => {
    const inputUnits = [unit2, unit1, unit3, unit2]
    const expectedOutput = [1, 2, 3]
    const actualOutput = buildOccupanciesArray(inputUnits)
    expect(actualOutput).toEqual(expectedOutput)
  })

  it("should handle an empty input array", () => {
    const inputUnits: Array<RailsUnitWithOccupancy> = []
    const expectedOutput = []
    const actualOutput = buildOccupanciesArray(inputUnits)
    expect(actualOutput).toEqual(expectedOutput)
  })

  it("should handle an input array with only one occupancy", () => {
    const inputUnits = [unit1, unit1, unit1]
    const expectedOutput = [1]
    const actualOutput = buildOccupanciesArray(inputUnits)
    expect(actualOutput).toEqual(expectedOutput)
  })
})

describe("groupAndSortUnitsByOccupancy", () => {
  it("should return the expected value", () => {
    const actualOutput = groupAndSortUnitsByOccupancy(units, amiCharts)
    expect(actualOutput).toEqual(groupedUnitsByOccupancy)
  })
})

describe("getAmiChartDataFromUnits", () => {
  test("returns empty array when given empty array of units", () => {
    const units: Array<RailsUnit> = []
    const result = getAmiChartDataFromUnits(units)
    expect(result).toEqual([])
  })

  test("returns unique chart data from array of units", () => {
    const result = getAmiChartDataFromUnits(units)
    expect(result).toEqual([
      { derivedFrom: "MaxAmi", year: 2021, type: "MOHCD", percent: 82 },
      {
        derivedFrom: "MinAmi",
        percent: 55,
        type: "MOHCD",
        year: 2021,
      },
      { derivedFrom: "MaxAmi", year: 2021, type: "MOHCD", percent: 109.8 },
      { derivedFrom: "MinAmi", year: 2021, type: "MOHCD", percent: 35 },
    ])
  })
})

describe("getPriorityTypeText", () => {
  test.each`
    priorityType                             | text
    ${"Vision impairments"}                  | ${"Vision Impairments"}
    ${"Hearing impairments"}                 | ${"Hearing Impairments"}
    ${"Hearing/Vision impairments"}          | ${"Vision and/or Hearing Impairments"}
    ${"Mobility/Hearing/Vision impairments"} | ${"Mobility, Hearing and/or Vision Impairments"}
    ${"Mobility impairments"}                | ${"Mobility Impairments"}
    ${"HCBS Units"}                          | ${"In-home Support for a Disability"}
  `(
    "returns text $text when priority type is $priorityType",
    ({ priorityType, text }: { priorityType: string; text: string }) => {
      expect(getPriorityTypeText(priorityType)).toBe(text)
    }
  )
})

describe("getTagContent", () => {
  test("returns undefined for listing without a reserved community or custom listing type", () => {
    expect(getTagContent(openSaleListing)).toBeUndefined()
  })

  test("returns tag content for custom listing type", () => {
    expect(getTagContent(saleEducatorListing)).toStrictEqual([
      { text: "SF public schools employee housing" },
    ])
  })

  test("returns tag content for reserved community type", () => {
    expect(getTagContent(habitatListing)).toStrictEqual([{ text: "Habitat Greater San Francisco" }])
  })

  test("tag content gives custom listing type precedence over reserved community type", () => {
    expect(getTagContent(saleListingReservedAndCustom)).toStrictEqual([
      { text: "SF public schools employee housing" },
    ])
  })
})

describe("listingHasVeteransPreference", () => {
  test("returns false for listings without Veterans-related preferences", () => {
    expect(listingHasVeteransPreference(closedRentalListing)).toBe(false)
  })

  test("returns true for listings with Veterans-related preferences", () => {
    expect(listingHasVeteransPreference(rentalVeteranPreferenceListing)).toBe(true)
  })
})

describe("preferenceNameHasVeteran", () => {
  test("returns true for strings that contain 'veteran'", () => {
    expect(preferenceNameHasVeteran("Veteran with Certificate of Preference (V-COP)")).toBe(true)
  })

  test("returns false for strings that do not contain 'veteran'", () => {
    expect(preferenceNameHasVeteran("Certificate of Preference (COP)")).toBe(false)
  })
})

describe("first come, first served", () => {
  test("returns false when listing is not fcfs", () => {
    expect(isFcfsListing(openSaleListing)).toBe(false)
  })

  test("returns false when listing is rental fcfs", () => {
    expect(isFcfsListing(openRentalFcfsListing)).toBe(false)
  })

  test("returns true when listing is sales fcfs", () => {
    expect(isFcfsListing(fcfsSaleListing)).toBe(true)
  })
})
