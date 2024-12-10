import type RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import type RailsSaleListing from "../api/types/rails/listings/RailsSaleListing"
import type {
  ListingEvent,
  ListingLotteryPreference,
} from "../api/types/rails/listings/BaseRailsListing"
import type {
  RailsUnitWithOccupancy,
  RailsUnitWithOccupancyAndMinMaxIncome,
} from "../api/types/rails/listings/RailsUnit"
import type RailsUnit from "../api/types/rails/listings/RailsUnit"
import type {
  RailsAmiChart,
  RailsAmiChartMetaData,
  RailsAmiChartValue,
} from "../api/types/rails/listings/RailsAmiChart"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import {
  RESERVED_COMMUNITY_TYPES,
  TENURE_TYPES,
  CUSTOM_LISTING_TYPES,
  LISTING_TYPE_FIRST_COME_FIRST_SERVED,
  LISTING_TYPES,
  LISTING_STATUS_ACTIVE,
  LISTING_TYPE_STANDARD_LOTTERY,
} from "../modules/constants"
import { RailsListing } from "../modules/listings/SharedHelpers"
import { LANGUAGE_CONFIGS, getCustomListingType, getReservedCommunityType } from "./languageUtil"
import { GroupedUnitsByOccupancy } from "../modules/listingDetails/ListingDetailsPricingTable"
import { getRangeString } from "../modules/listings/DirectoryHelpers"
import { t } from "@bloom-housing/ui-components"
import { ListingState } from "../modules/listings/ListingState"

export const isFcfsSalesListing = (listing: RailsRentalListing | RailsSaleListing) => {
  return (
    listing.Listing_Type === LISTING_TYPE_FIRST_COME_FIRST_SERVED &&
    listing.RecordType.Name === LISTING_TYPES.OWNERSHIP
  )
}

export const isLotterySalesListing = (listing: RailsRentalListing | RailsSaleListing) => {
  return (
    listing.Listing_Type === LISTING_TYPE_STANDARD_LOTTERY &&
    listing.RecordType.Name === LISTING_TYPES.OWNERSHIP
  )
}

export const getFcfsSalesListingState = (listing: RailsSaleListing): ListingState => {
  if (
    (!!listing.Status && listing.Status !== LISTING_STATUS_ACTIVE) ||
    !listing.Accepting_Online_Applications
  ) {
    return ListingState.Closed
  }

  if (dayjs(listing.Application_Start_Date_Time) < dayjs()) {
    return ListingState.Open
  }

  return ListingState.NotYetOpen
}

/**
 * Check if a listing is for Habitat for Humanity
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is for Habitat for Humanity, false otherwise
 */
export const isHabitatListing = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Reserved_community_type === RESERVED_COMMUNITY_TYPES.HABITAT

/**
 * Check if lottery is complete for a listing
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the lottery is complete and results are ready to be published, false otherwise
 */
export const isLotteryComplete = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Publish_Lottery_Results_on_DAHLIA &&
  listing.Publish_Lottery_Results_on_DAHLIA !== "Not published" &&
  listing.Lottery_Status === "Lottery Complete"

/**
 * Check if only the lottery results PDF URL should be shown
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the lottery is complete and results are ready to be published, false otherwise
 */
export const showLotteryResultsPDFonly = (listing: RailsRentalListing | RailsSaleListing) =>
  !!listing.LotteryResultsURL &&
  listing.Publish_Lottery_Results_on_DAHLIA === "Publish only PDF results on DAHLIA" &&
  listing.Lottery_Status === "Lottery Complete"

/**
 * Check if a listing is open for applying
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is accepting applications, false otherwise
 */
export const isOpen = (listing: RailsRentalListing | RailsSaleListing) =>
  dayjs(listing.Application_Due_Date) > dayjs()

/**
 * Check if a listing is one of the three Shirley Chisholm listing
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is a Shirley Chisholm listing, false otherwise
 */
export const isEducator = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Custom_Listing_Type === CUSTOM_LISTING_TYPES.EDUCATOR_ONE ||
  listing.Custom_Listing_Type === CUSTOM_LISTING_TYPES.EDUCATOR_TWO ||
  listing.Custom_Listing_Type === CUSTOM_LISTING_TYPES.EDUCATOR_THREE

/**
 * Check if a listing is Shirley Chisholm listing 1
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is Shirley Chisholm listing 1, false otherwise
 */
export const isEducatorOne = (listing: RailsRentalListing | RailsSaleListing): boolean =>
  listing.Custom_Listing_Type === CUSTOM_LISTING_TYPES.EDUCATOR_ONE

/**
 * Check if a listing is Shirley Chisholm listing 2
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is Shirley Chisholm listing 2, false otherwise
 */
export const isEducatorTwo = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Custom_Listing_Type === CUSTOM_LISTING_TYPES.EDUCATOR_TWO

/**
 * Check if a listing is a rental
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is a rental, false otherwise
 */
export const isRental = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Tenure === TENURE_TYPES.NEW_RENTAL || listing.Tenure === TENURE_TYPES.RE_RENTAL

/**
 * Check if a listing is a sale
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is a sale, false otherwise
 */
export const isSale = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Tenure === TENURE_TYPES.NEW_SALE || listing.Tenure === TENURE_TYPES.RESALE

/**
 * Check if a listing is BMR
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is BMR, false otherwise
 */
export const isBMR = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Program_Type === "IH-RENTAL" || listing.Program_Type === "IH-OWN"

/**
 * Check if a listing has only SRO units
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing has all SRO unit types, false otherwise
 */
export const listingHasOnlySROUnits = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.unitSummaries.general?.every(
    (unit) => unit.unitType === "SRO" || unit.unitType === "Room"
  )

/**
 * Check if a listing has at least one SRO unit
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing has at least one SRO unit type, false otherwise
 */
export const listingHasSROUnits = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.unitSummaries.general?.some((unit) => unit.unitType === "SRO" || unit.unitType === "Room")
/**
 * Check if a listing is multi-occupancy SRO
 * @param {string} name
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing id is has SROs that
 * permit multiple occupancy, false otherwise
 */
export const isPluralSRO = (listing: RailsRentalListing | RailsSaleListing): boolean => {
  return listing.unitSummaries.general?.some(
    (unit) => (unit.unitType === "SRO" || unit.unitType === "Room") && unit.maxOccupancy > 1
  )
}
/**
 * Builds and return an address string. Not to be used for display. Use
 * {@link ListingAddress} instead.
 * @param  {RailsRentalListing | RailsRentalListing} listing
 * @returns {string} the full address string if all required fields are present, empty
 * string otherwise
 */
export const getListingAddressString = (listing: RailsListing): string => {
  return (
    (listing.Building_Street_Address &&
      listing.Building_City &&
      listing.Building_State &&
      listing.Building_Zip_Code &&
      `${listing.Building_Street_Address}, ${listing.Building_City}, ${listing.Building_State} ${listing.Building_Zip_Code}`) ||
    ""
  )
}

export const getEventTimeString = (listingEvent: ListingEvent) => {
  if (listingEvent.Start_Time) {
    return listingEvent.End_Time
      ? `${listingEvent.Start_Time} - ${listingEvent.End_Time}`
      : listingEvent.Start_Time
  }
  return ""
}

const formatEventTime = (eventTime: string) => {
  if (eventTime) {
    const hour = Number.parseInt(eventTime, 10)
    const suffix = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour > 12 ? hour - 12 : hour
    return `${formattedHour}:00 ${suffix}`
  }
  return ""
}

export const getEventDateTime = (eventDate: string, eventTime: string) => {
  const startTime = eventTime?.includes(":") ? eventTime : `${formatEventTime(eventTime)}`
  dayjs.extend(customParseFormat)
  return dayjs(`${eventDate} ${startTime}`, "YYYY-MM-DD h:mmA").tz()
}

export const sortByDateTimeString = (dateTimeA: dayjs.Dayjs, dateTimeB: dayjs.Dayjs) => {
  return dateTimeA.diff(dateTimeB)
}

/**
 * Check if a listing is accepting paper applications
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is accepting paper applications, false otherwise
 */
export const acceptingPaperApplications = (listing: RailsListing): boolean => {
  return listing.Accepting_applications_at_leasing_agent || listing.Accepting_applications_by_PO_Box
}

type PaperApplication = {
  languageString: string
  fileURL: string
}

/**
 * Returns an array of all the paper application URLs
 * @param {boolean} isRental
 * @returns {PaperApplication[]}
 */
export const paperApplicationURLs = (isRental: boolean): PaperApplication[] => {
  const mohcdPaperAppURLBase = "https://sfmohcd.org/sites/default/files/Documents/MOH/"

  const mohcdRentalPaperAppURLTemplate =
    mohcdPaperAppURLBase +
    "BMR%20Rental%20Paper%20Applications/" +
    "{lang}%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf"

  const mohcdSalePaperAppURLTemplate =
    mohcdPaperAppURLBase +
    "BMR%20Ownership%20Paper%20Applications/" +
    "{lang}%20BMR%20Own%20Short%20Form%20Paper%20App.pdf"

  const paperAppLanguages = [
    { language: "English", prefix: "en" },
    { language: "Spanish", prefix: "es" },
    { language: "Chinese", prefix: "zh" },
    { language: "Tagalog", prefix: "tl" },
  ]

  const urlBase = isRental ? mohcdRentalPaperAppURLTemplate : mohcdSalePaperAppURLTemplate
  return paperAppLanguages.map((lang): PaperApplication => {
    return {
      languageString: LANGUAGE_CONFIGS[lang.prefix].getLabel(),
      fileURL: urlBase.replace("{lang}", lang.language),
    }
  })
}

export const deriveIncomeFromAmiCharts = (
  unit: RailsUnit,
  occupancy: number,
  amiCharts: RailsAmiChart[],
  min?: boolean
): number => {
  if (!unit || !occupancy || !amiCharts) {
    return null
  }

  const amiFromAmiChart = amiCharts.find((amiData: RailsAmiChart) => {
    return (
      Number(amiData.percent) ===
        unit[min ? "Min_AMI_for_Qualifying_Unit" : "Max_AMI_for_Qualifying_Unit"] &&
      amiData.chartType === unit.AMI_chart_type &&
      amiData.year === unit.AMI_chart_year?.toString()
    )
  })?.values

  const occupancyAmi = amiFromAmiChart?.find((ami: RailsAmiChartValue) => {
    return ami.numOfHousehold === occupancy
  })

  if (occupancyAmi) {
    if (min) {
      return Math.ceil(occupancyAmi?.amount / 12)
    }
    return Math[min ? "ceil" : "floor"](occupancyAmi?.amount / 12)
  }

  return null
}

/**
 *
 * For rental listings, we ignore the minimum AMI Value in ~all~ cases, including 415.
 * For Sale listings, we try to derive the minimum AMI, if we can't then we return -1.
 */
const determineMinIncomeNeeded = (
  unit: RailsUnitWithOccupancy,
  amiCharts: RailsAmiChart[],
  isSale: boolean
) => {
  return isSale
    ? deriveIncomeFromAmiCharts(unit, unit.occupancy, amiCharts, true) || -1
    : unit?.BMR_Rental_Minimum_Monthly_Income_Needed || -1
}

export const applyMinMaxIncomeToUnit =
  (amiCharts: RailsAmiChart[], isSale?: boolean) =>
  (unit: RailsUnitWithOccupancy): RailsUnitWithOccupancyAndMinMaxIncome => {
    const maxMonthlyIncomeNeeded = Math.round(
      deriveIncomeFromAmiCharts(unit, unit.occupancy, amiCharts)
    )
    const minMonthlyIncomeNeeded = Math.round(determineMinIncomeNeeded(unit, amiCharts, isSale))
    return { ...unit, maxMonthlyIncomeNeeded, minMonthlyIncomeNeeded }
  }

export const addUnitsWithEachOccupancy = (units: RailsUnit[]): RailsUnitWithOccupancy[] => {
  const totalUnits = []
  units.forEach((unit: RailsUnit) => {
    if (!unit.Max_Occupancy) {
      unit.Max_Occupancy = unit.Min_Occupancy + 2
    }

    for (let i = unit.Min_Occupancy; i <= unit.Max_Occupancy; i++) {
      totalUnits.push({ ...unit, occupancy: i })
    }
  })
  return totalUnits
}

export const buildAmiArray = (
  units: RailsUnitWithOccupancyAndMinMaxIncome[]
): Array<{ min: number | undefined; max: number }> => {
  const arrayOfAmis: Array<{ min: number | undefined; max: number }> = []
  units.forEach((unit: RailsUnitWithOccupancyAndMinMaxIncome) => {
    if (arrayOfAmis.some((ami) => ami.max === unit.Max_AMI_for_Qualifying_Unit)) {
      return
    }
    arrayOfAmis.push({
      min: unit.Min_AMI_for_Qualifying_Unit,
      max: unit.Max_AMI_for_Qualifying_Unit,
    })
  })
  arrayOfAmis.sort(function (a, b) {
    return a.max - b.max
  })
  return arrayOfAmis
}

export const buildOccupanciesArray = (units: RailsUnitWithOccupancy[]): Array<number> => {
  const arrayOfOccupancies = []
  units.forEach((unit: RailsUnitWithOccupancy) => {
    if (arrayOfOccupancies.includes(unit.occupancy)) {
      return
    }
    arrayOfOccupancies.push(unit.occupancy)
  })

  arrayOfOccupancies.sort(function (a, b) {
    return a - b
  })
  return arrayOfOccupancies
}

/**
 * Returns a collapsed array of units grouped by matching criteria with updated availability
 * @param {RailsUnitWithOccupancyAndMinMaxIncome[]} units
 * @returns {RailsUnitWithOccupancyAndMinMaxIncome[]}
 */
export const matchSharedUnitFields = (
  units: RailsUnitWithOccupancyAndMinMaxIncome[]
): RailsUnitWithOccupancyAndMinMaxIncome[] => {
  const collapsedUnits = []
  // Process each unit in units by finding its matchingUnits
  const unitsCopy = units.map((unit) => {
    return { ...unit }
  })
  while (unitsCopy.length > 0) {
    const unit = unitsCopy[0]
    const matchingUnits = unitsCopy.filter((curUnit: RailsUnitWithOccupancyAndMinMaxIncome) => {
      return (
        unit.BMR_Rent_Monthly === curUnit.BMR_Rent_Monthly &&
        unit.Unit_Type === curUnit.Unit_Type &&
        unit.occupancy === curUnit.occupancy &&
        unit.maxMonthlyIncomeNeeded === curUnit.maxMonthlyIncomeNeeded &&
        unit.BMR_Rental_Minimum_Monthly_Income_Needed ===
          curUnit.BMR_Rental_Minimum_Monthly_Income_Needed &&
        unit.Max_AMI_for_Qualifying_Unit === curUnit.Max_AMI_for_Qualifying_Unit
      )
    })
    // Remove duplicate matchingUnits from units
    matchingUnits.forEach((curUnit: RailsUnitWithOccupancyAndMinMaxIncome) => {
      unitsCopy.splice(unitsCopy.indexOf(curUnit), 1)
    })
    // If min / max range exists, update unit for sales and HOA price with/out parking
    const pricesWithParking = matchingUnits
      .map((u) => Math.round(Number(u.Price_With_Parking)))
      .filter((num) => !Number.isNaN(num))
    if (pricesWithParking.length > 0) {
      unit.Price_With_Parking = getRangeString(
        Math.min(...pricesWithParking),
        Math.max(...pricesWithParking),
        true
      )
    }
    const pricesWithoutParking = matchingUnits
      .map((u) => Math.round(Number(u.Price_Without_Parking)))
      .filter((num) => !Number.isNaN(num))
    if (pricesWithoutParking.length > 0) {
      unit.Price_Without_Parking = getRangeString(
        Math.min(...pricesWithoutParking),
        Math.max(...pricesWithoutParking),
        true
      )
    }
    const hoaWithParking = matchingUnits
      .map((u) => Math.round(Number(u.HOA_Dues_With_Parking)))
      .filter((num) => !Number.isNaN(num))
    if (hoaWithParking.length > 0) {
      unit.HOA_Dues_With_Parking = getRangeString(
        Math.min(...hoaWithParking),
        Math.max(...hoaWithParking),
        true
      )
    }
    const hoaWithoutParking = matchingUnits
      .map((u) => Math.round(Number(u.HOA_Dues_Without_Parking)))
      .filter((num) => !Number.isNaN(num))
    if (hoaWithoutParking.length > 0) {
      unit.HOA_Dues_Without_Parking = getRangeString(
        Math.min(...hoaWithoutParking),
        Math.max(...hoaWithoutParking),
        true
      )
    }
    // Update availability based on availability in matchingUnits
    let numAvailable = 0
    matchingUnits.forEach((curUnit: RailsUnitWithOccupancyAndMinMaxIncome) => {
      numAvailable += curUnit.Availability
    })
    unit.Availability = numAvailable
    collapsedUnits.push(unit)
  }
  return collapsedUnits
}

export const getAbsoluteMinAndMaxIncome = (
  units: RailsUnitWithOccupancyAndMinMaxIncome[]
): { absoluteMaxIncome: number; absoluteMinIncome: number } => {
  let absoluteMaxIncome = 0
  let absoluteMinIncome = units[0]?.minMonthlyIncomeNeeded

  units.forEach((unit: RailsUnitWithOccupancyAndMinMaxIncome) => {
    if (unit?.maxMonthlyIncomeNeeded > absoluteMaxIncome) {
      absoluteMaxIncome = unit.maxMonthlyIncomeNeeded
    }
    if (unit?.minMonthlyIncomeNeeded < absoluteMinIncome) {
      absoluteMinIncome = unit?.minMonthlyIncomeNeeded
    }
  })

  return { absoluteMaxIncome, absoluteMinIncome }
}

export const groupAndSortUnitsByOccupancy = (
  units: RailsUnit[],
  amiCharts: RailsAmiChart[],
  isSale?: boolean
): GroupedUnitsByOccupancy[] => {
  /*
   * make a deep copy
   */
  const unitsCopy = units.map((unit) => {
    return { ...unit }
  })

  /*
   * Each unit from the api call has a min and max occupancy. Each value in that range has a row in the pricing table, so we'll add a
   * unit for each occupancy, e.g. with a min of 1 and max of 3, we'll have a unit with occupancy 1, a unit with occupancy 2,
   * and a unit with occupancy 3
   */
  const unitsWithOccupancy = addUnitsWithEachOccupancy(unitsCopy)
  /*
   * We have to derive the max and min income using ami charts, so this mapping goes through each unit
   * and does that and adds that max and min income to the unit object.
   * The Min income is derived through two means: by the AMI Chart for that value or via the BMR_Rental_Minimum_Monthly_Income_Needed field.
   * The former is only applicable when the listing is a Section 415 housing listing (meaning there are discrete AMI ranges), while the latter
   * is calculated in Salesforce by multiplying the base rent by the rent multiple (usually 2x).
   * To determine this, we check if there is a BMR value and use that if there is, if not, we try to use the minimum AMI field.
   * If neither of those are available, the value becomes -1, which forces the table to display "Up To".
   */
  const unitsWithOccupancyAndMinMaxIncome = unitsWithOccupancy.map(
    applyMinMaxIncomeToUnit(amiCharts, isSale)
  )

  /*
   * There's a certain number of fields where we only want to show one row, but increase the availability field. e.g.
   * two units with the same occupancy and unit type will only display one row with an availability of 2 units.
   */
  const unitSummaries = matchSharedUnitFields(unitsWithOccupancyAndMinMaxIncome)

  /*
   * Using the unit summaries, we build a sorted array of the occupancies values, e.g. [1, 3, 4, 5].
   * This gives us the foundation to build the pricing table accordions.
   */
  const occupanciesArray = buildOccupanciesArray(unitSummaries)

  /*
   * With the necessary fields added to the units and the array of occupancies built, we can
   * then map the Unit data from the api into the pricing table.
   */
  const sortedUnitsByOccupancy = occupanciesArray.map((occupancy) => {
    const unitsWithOccupancy = unitSummaries.filter((unit) => unit.occupancy === occupancy)

    const { absoluteMaxIncome, absoluteMinIncome } = getAbsoluteMinAndMaxIncome(unitsWithOccupancy)

    return {
      occupancy,
      absoluteMaxIncome: absoluteMaxIncome,
      absoluteMinIncome: absoluteMinIncome,
      amiRows: buildAmiArray(unitsWithOccupancy).map((ami) => {
        const unitsWithAmi = unitsWithOccupancy.filter(
          (unit) => unit.Max_AMI_for_Qualifying_Unit === ami.max
        )
        return {
          ami,
          units: unitsWithAmi,
        }
      }),
    }
  })

  return sortedUnitsByOccupancy
}

export const getAmiChartDataFromUnits = (units: RailsUnit[]): RailsAmiChartMetaData[] => {
  const uniqueCharts = []

  units?.forEach((unit: RailsUnit) => {
    const uniqueChartMatchForMax = uniqueCharts.find((uniqueChart) => {
      return (
        uniqueChart.year === unit.AMI_chart_year &&
        uniqueChart.type === unit.AMI_chart_type &&
        uniqueChart.percent === unit.Max_AMI_for_Qualifying_Unit
      )
    })

    const uniqueChartMatchForMin = uniqueCharts.find((uniqueChart) => {
      return (
        uniqueChart.year === unit.AMI_chart_year &&
        uniqueChart.type === unit.AMI_chart_type &&
        uniqueChart.percent === unit.Min_AMI_for_Qualifying_Unit
      )
    })

    /*
     * It's possible that there'll only be a unit.Max_AMI_for_Qualifying_Unit or unit.Min_AMI_for_Qualifying_Unit,
     * but the rest of fields should exist
     */
    if (!uniqueChartMatchForMax && unit.Max_AMI_for_Qualifying_Unit) {
      uniqueCharts.push({
        year: unit.AMI_chart_year,
        type: unit.AMI_chart_type,
        percent: unit.Max_AMI_for_Qualifying_Unit,
        derivedFrom: "MaxAmi",
      })
    }

    if (!uniqueChartMatchForMin && unit.Min_AMI_for_Qualifying_Unit) {
      uniqueCharts.push({
        year: unit.AMI_chart_year,
        type: unit.AMI_chart_type,
        percent: unit.Min_AMI_for_Qualifying_Unit,
        derivedFrom: "MinAmi",
      })
    }
  })

  return uniqueCharts
}

export const getLongestAmiChartValueLength = (amiCharts: RailsAmiChart[]): number => {
  let longestChartLength: number

  amiCharts.forEach((chart: RailsAmiChart) => {
    if (!longestChartLength || chart?.values.length > longestChartLength) {
      longestChartLength = chart?.values.length
    }
  })

  return longestChartLength
}

export const getMinMaxOccupancy = (
  units: RailsUnit[],
  amiCharts: RailsAmiChart[]
): { explicitMaxOccupancy: boolean; minOccupancy: number; maxOccupancy: number } => {
  const unitsCopy = units.map((unit) => {
    return { ...unit }
  })
  /*
   * Each unit from the api call has a min and max occupancy. Each value in that range has a row in the pricing table, so we'll add a
   * unit for each occupancy, e.g. with a min of 1 and max of 3, we'll have a unit with occupancy 1, a unit with occupancy 2,
   * and a unit with occupancy 3
   */
  const unitsWithOccupancy = addUnitsWithEachOccupancy(unitsCopy)

  /*
   * We have to derive the max income using ami charts, so this mapping goes through each unit
   * and does that and adds that max income to the unit object
   */
  const unitsWithOccupancyAndMaxIncome = unitsWithOccupancy.map(applyMinMaxIncomeToUnit(amiCharts))

  /*
   * There's a certain number of fields where we only want to show one row, but increase the availability field. e.g.
   * two units with the same occupancy and unit type will only display one row with an availability of 2 units.
   */
  const unitSummaries = matchSharedUnitFields(unitsWithOccupancyAndMaxIncome)
  /*
   * Using the unit summaries, we build a sorted array of the occupancies values, e.g. [1, 3, 4, 5].
   * This gives us the foundation to build the pricing table accordions.
   */
  const occupanciesArray = buildOccupanciesArray(unitSummaries)

  const unprocessedUnitsHaveMaxOccupancy = units?.some((unit) => {
    return unit.Max_Occupancy
  })

  return {
    explicitMaxOccupancy: unprocessedUnitsHaveMaxOccupancy,
    minOccupancy: occupanciesArray[0],
    maxOccupancy: unprocessedUnitsHaveMaxOccupancy
      ? occupanciesArray[occupanciesArray.length - 1]
      : getLongestAmiChartValueLength(amiCharts),
  }
}

export const getPriorityTypeText = (priorityType: string): string => {
  let text: string
  switch (priorityType) {
    case "Vision impairments":
      text = t("listings.prioritiesDescriptor.vision")
      break
    case "Hearing impairments":
      text = t("listings.prioritiesDescriptor.hearing")
      break
    case "Hearing/Vision impairments":
      text = t("listings.prioritiesDescriptor.hearingVision")
      break
    case "Mobility/Hearing/Vision impairments":
      text = t("listings.prioritiesDescriptor.mobilityHearingVision")
      break
    case "Mobility impairments":
      text = t("listings.prioritiesDescriptor.mobility")
      break
    case "Hearing/Vision (Communication)":
      text = t("listings.Hearing/Vision (Communication).title")
      break
    case "HCBS Units":
      text = t("listings.HCBS Units.title")
      break
    default:
      text = ""
  }
  return text
}

// return content to display in image tag
export const getTagContent = (listing: RailsListing) => {
  // Custom_Listing_Type takes precedence for deciding tag content
  if (listing.Custom_Listing_Type) {
    const text: string = getCustomListingType(listing.Custom_Listing_Type)
    if (text) return [{ text }]
  }
  // else use Reserved_community_type for deciding tag content
  return listing.Reserved_community_type
    ? [{ text: getReservedCommunityType(listing.Reserved_community_type) }]
    : undefined
}

export const preferenceNameHasVeteran = (preferenceName: string): boolean =>
  typeof preferenceName === "string" && preferenceName.toLowerCase().includes("veteran")

export const listingHasVeteransPreference = (listing: RailsListing): boolean => {
  return !!listing.Listing_Lottery_Preferences?.some((preference: ListingLotteryPreference) =>
    preferenceNameHasVeteran(preference?.Lottery_Preference?.Name)
  )
}

export const forceRecacheParam = () => ({
  params: window.location.search.includes("preview=true") ? { force: true } : {},
})
