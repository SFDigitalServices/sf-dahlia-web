import type RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import type RailsSaleListing from "../api/types/rails/listings/RailsSaleListing"
import type { ListingEvent } from "../api/types/rails/listings/BaseRailsListing"
import type {
  RailsUnitWithOccupancy,
  RailsUnitWithOccupancyAndMaxIncome,
} from "../api/types/rails/listings/RailsUnit"
import type RailsUnit from "../api/types/rails/listings/RailsUnit"
import type {
  RailsAmiChart,
  RailsAmiChartMetaData,
  RailsAmiChartValue,
} from "../api/types/rails/listings/RailsAmiChart"
import dayjs from "dayjs"
import { RESERVED_COMMUNITY_TYPES, TENURE_TYPES } from "../modules/constants"
import { RailsListing } from "../modules/listings/SharedHelpers"
import { LANGUAGE_CONFIGS } from "./languageUtil"
import { GroupedUnitsByOccupancy } from "../modules/listingDetails/ListingDetailsPricingTable"

export const areLotteryResultsShareable = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Publish_Lottery_Results && listing.Lottery_Status === "Lottery Complete"

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
 * @returns {boolean} returns true if the lottery is complete and has a lottery date, false otherwise
 */
export const isLotteryComplete = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Publish_Lottery_Results && listing.Lottery_Status === "Lottery Complete"

/**
 * Check if a listing is open for applying
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is accepting applications, false otherwise
 */
export const isOpen = (listing: RailsRentalListing | RailsSaleListing) =>
  dayjs(listing.Application_Due_Date) > dayjs()

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
  listing.unitSummaries.general.every((unit) => unit.unitType === "SRO")

/**
 * Check if a listing has at least one SRO unit
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing has at least one SRO unit type, false otherwise
 */
export const listingHasSROUnits = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.unitSummaries.general.some((unit) => unit.unitType === "SRO")
/**
 * Check if a listing is multi-occupancy SRO
 * @param {string} name
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is in the harcoded list of SROs that
 * permit multiple occupancy, false otherwise
 */
export const isPluralSRO = (name: string, listing: RailsRentalListing | RailsSaleListing) => {
  return process.env.SRO_PLURAL_LISTINGS?.[listing.Id] === name
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
  amiCharts: RailsAmiChart[]
): number => {
  if (!unit || !occupancy || !amiCharts) {
    return null
  }

  const amiFromAmiChart = amiCharts.find((amiData: RailsAmiChart) => {
    return (
      Number(amiData.percent) === unit.Max_AMI_for_Qualifying_Unit &&
      amiData.chartType === unit.AMI_chart_type
    )
  })?.values

  const occupancyAmi = amiFromAmiChart?.find((ami: RailsAmiChartValue) => {
    return ami.numOfHousehold === occupancy
  })

  if (occupancyAmi) {
    return Math.floor(occupancyAmi?.amount / 12)
  }

  return null
}

export const applyMaxIncomeToUnit =
  (amiCharts: RailsAmiChart[]) =>
  (unit: RailsUnitWithOccupancy): RailsUnitWithOccupancyAndMaxIncome => {
    const maxMonthlyIncomeNeeded = deriveIncomeFromAmiCharts(unit, unit.occupancy, amiCharts)
    return { ...unit, maxMonthlyIncomeNeeded }
  }

export const addUnitsWithEachOccupancy = (units: RailsUnit[]): RailsUnitWithOccupancy[] => {
  const totalUnits = []
  units.forEach((unit: RailsUnit) => {
    if (!unit.Max_Occupancy) {
      unit.Max_Occupancy = 3
    }
    for (let i = unit.Min_Occupancy; i <= unit.Max_Occupancy; i++) {
      totalUnits.push({ ...unit, occupancy: i })
    }
  })
  return totalUnits
}

export const buildAmiArray = (units: RailsUnitWithOccupancyAndMaxIncome[]): Array<number> => {
  const arrayOfAmis = []
  units.forEach((unit: RailsUnitWithOccupancyAndMaxIncome) => {
    if (arrayOfAmis.includes(unit.Max_AMI_for_Qualifying_Unit)) {
      return
    }
    arrayOfAmis.push(unit.Max_AMI_for_Qualifying_Unit)
  })
  arrayOfAmis.sort(function (a, b) {
    return a - b
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

export const matchSharedUnitFields = (
  units: RailsUnitWithOccupancyAndMaxIncome[]
): RailsUnitWithOccupancyAndMaxIncome[] => {
  const collapsedUnits = []
  units.forEach((unit: RailsUnitWithOccupancyAndMaxIncome) => {
    const summaryThatsAlreadyAdded = collapsedUnits.find(
      (collapsedUnit: RailsUnitWithOccupancyAndMaxIncome) => {
        return (
          unit.BMR_Rent_Monthly === collapsedUnit.BMR_Rent_Monthly &&
          unit.Unit_Type === collapsedUnit.Unit_Type &&
          unit.occupancy === collapsedUnit.occupancy &&
          unit.maxMonthlyIncomeNeeded === collapsedUnit.maxMonthlyIncomeNeeded &&
          unit.BMR_Rental_Minimum_Monthly_Income_Needed ===
            collapsedUnit.BMR_Rental_Minimum_Monthly_Income_Needed &&
          unit.Max_AMI_for_Qualifying_Unit === collapsedUnit.Max_AMI_for_Qualifying_Unit
        )
      }
    )

    if (!summaryThatsAlreadyAdded) {
      collapsedUnits.push(unit)
    } else {
      summaryThatsAlreadyAdded.Availability += unit.Availability
    }
  })
  return collapsedUnits
}

export const getAbsoluteMinAndMaxIncome = (
  units: RailsUnitWithOccupancyAndMaxIncome[]
): { absoluteMaxIncome: number; absoluteMinIncome: number } => {
  let absoluteMaxIncome = 0
  let absoluteMinIncome = units[0]?.BMR_Rental_Minimum_Monthly_Income_Needed

  units.forEach((unit: RailsUnitWithOccupancyAndMaxIncome) => {
    if (unit?.maxMonthlyIncomeNeeded > absoluteMaxIncome) {
      absoluteMaxIncome = unit.maxMonthlyIncomeNeeded
    }
    if (unit?.BMR_Rental_Minimum_Monthly_Income_Needed < absoluteMinIncome) {
      absoluteMinIncome = unit?.BMR_Rental_Minimum_Monthly_Income_Needed
    }
  })

  return { absoluteMaxIncome, absoluteMinIncome }
}

export const groupAndSortUnitsByOccupancy = (
  units: RailsUnit[],
  amiCharts: RailsAmiChart[]
): GroupedUnitsByOccupancy[] => {
  /*
   * Each unit from the api call has a min and max occupancy. Each value in that range has a row in the pricing table, so we'll add a
   * unit for each occupancy, e.g. with a min of 1 and max of 3, we'll have a unit with occupancy 1, a unit with occupancy 2,
   * and a unit with occupancy 3
   */
  const unitsWithOccupancy = addUnitsWithEachOccupancy(units)

  /*
   * We have to derive the max income using ami charts, so this mapping goes through each unit
   * and does that and adds that max income to the unit object
   */
  const unitsWithOccupancyAndMaxIncome = unitsWithOccupancy.map(applyMaxIncomeToUnit(amiCharts))

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
          (unit) => unit.Max_AMI_for_Qualifying_Unit === ami
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

  units.forEach((unit: RailsUnit) => {
    const uniqueChartMatch = uniqueCharts.find((uniqueChart) => {
      return (
        uniqueChart.year === unit.AMI_chart_year &&
        uniqueChart.type === unit.AMI_chart_type &&
        uniqueChart.percent === unit.Max_AMI_for_Qualifying_Unit
      )
    })

    if (!uniqueChartMatch) {
      uniqueCharts.push({
        year: unit.AMI_chart_year,
        type: unit.AMI_chart_type,
        percent: unit.Max_AMI_for_Qualifying_Unit,
      })
    }
  })

  return uniqueCharts
}
