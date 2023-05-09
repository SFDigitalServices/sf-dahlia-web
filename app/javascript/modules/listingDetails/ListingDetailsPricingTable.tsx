import React, { useContext, useEffect } from "react"
import { CategoryTable, ContentAccordion, Icon, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isHabitatListing, isSale, groupAndSortUnitsByOccupancy } from "../../util/listingUtil"
import RailsUnit, {
  RailsUnitWithOccupancyAndMaxIncome,
} from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart } from "../../api/types/rails/listings/RailsAmiChart"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"

export interface ListingDetailsPricingTableProps {
  listing: RailsListing
}

export interface AmiRow {
  ami: number
  units: RailsUnitWithOccupancyAndMaxIncome[]
}

export interface GroupedUnitsByOccupancy {
  occupancy: number
  absoluteMinIncome: number
  absoluteMaxIncome: number
  amiRows: AmiRow[]
}

const buildSalePriceCellRow = (unit: RailsUnitWithOccupancyAndMaxIncome) => {
  if (unit.Price_With_Parking && unit.Price_Without_Parking) {
    return [
      {
        cellText: `$${unit.Price_With_Parking?.toLocaleString()}`,
        cellSubText: "with parking",
      },
      {
        cellText: `$${unit.Price_Without_Parking?.toLocaleString()}`,
        cellSubText: "without parking",
      },
    ]
  }

  if (unit.Price_With_Parking && !unit.Price_Without_Parking) {
    return [
      {
        cellText: `$${unit.Price_With_Parking?.toLocaleString()}`,
        cellSubText: "with parking",
      },
    ]
  }

  if (!unit.Price_With_Parking && unit.Price_Without_Parking) {
    return [
      {
        cellText: `$${unit.Price_Without_Parking?.toLocaleString()}`,
        cellSubText: "without parking",
      },
    ]
  }
}

const buildSaleHoaDuesCellRow = (unit: RailsUnitWithOccupancyAndMaxIncome) => {
  if (unit?.HOA_Dues_With_Parking && unit?.HOA_Dues_Without_Parking) {
    return [
      {
        cellText: `$${(unit?.HOA_Dues_With_Parking).toLocaleString()}`,
        cellSubText: "with parking",
      },
      {
        cellText: `$${(unit?.HOA_Dues_Without_Parking).toLocaleString()}`,
        cellSubText: "without parking",
      },
    ]
  }

  if (unit?.HOA_Dues_With_Parking && !unit?.HOA_Dues_Without_Parking) {
    return [
      {
        cellText: `$${(unit?.HOA_Dues_With_Parking).toLocaleString()}`,
        cellSubText: "with parking",
      },
    ]
  }

  if (!unit?.HOA_Dues_With_Parking && unit?.HOA_Dues_Without_Parking) {
    return [
      {
        cellText: `$${(unit?.HOA_Dues_Without_Parking).toLocaleString()}`,
        cellSubText: "without parking",
      },
    ]
  }
}

const buildSaleCells = (unit: RailsUnitWithOccupancyAndMaxIncome) => {
  return {
    units: {
      cellText: unit.Unit_Type,
      cellSubText: `${unit?.Availability} ${t("t.available")}`,
    },
    income: {
      cellText: `$${unit?.BMR_Rental_Minimum_Monthly_Income_Needed?.toLocaleString()} to $${unit?.maxMonthlyIncomeNeeded?.toLocaleString()}`,
      cellSubText: t("t.perMonth"),
    },
    sale: buildSalePriceCellRow(unit),
    monthlyHoaDues: buildSaleHoaDuesCellRow(unit),
  }
}

const buildRentalCells = (unit: RailsUnitWithOccupancyAndMaxIncome) => {
  return {
    units: {
      cellText: unit.Unit_Type,
      cellSubText: `${unit.Availability} ${t("t.available")}`,
    },
    income: {
      cellText: `$${unit?.BMR_Rental_Minimum_Monthly_Income_Needed?.toLocaleString()} to $${unit?.maxMonthlyIncomeNeeded?.toLocaleString()}`,
      cellSubText: t("t.perMonth"),
    },
    rent: {
      cellText: unit?.BMR_Rent_Monthly
        ? `$${unit?.BMR_Rent_Monthly?.toLocaleString()}`
        : `${unit?.Rent_percent_of_income}%`,
      cellSubText: unit?.BMR_Rent_Monthly ? t("t.perMonth") : t("t.income"),
    },
  }
}

const buildAccordions = (
  groupedUnitsByOccupancy: GroupedUnitsByOccupancy[],
  listingIsSale: boolean
) => {
  return groupedUnitsByOccupancy?.map(
    (occupancy: GroupedUnitsByOccupancy, index: number, array) => {
      const accordionLength = array.length

      const categoryData = occupancy?.amiRows?.map((amiRow: AmiRow) => {
        const responsiveTableRows = amiRow.units.map((unit: RailsUnitWithOccupancyAndMaxIncome) => {
          return listingIsSale ? buildSaleCells(unit) : buildRentalCells(unit)
        })

        const responsiveTableHeaders = listingIsSale
          ? {
              units: { name: "t.unitType" },
              income: { name: "shortFormNav.income" },
              sale: { name: "listings.stats.salesPrice" },
              monthlyHoaDues: { name: "listings.stats.monthlyHoaDues" },
            }
          : {
              units: { name: "t.unitType" },
              income: { name: "t.incomeRange" },
              rent: { name: "t.rent" },
            }

        return {
          header: t("listings.stats.upToPercentAmi", {
            amiPercent: amiRow.ami,
          }),
          tableData: {
            stackedData: responsiveTableRows,
            headers: responsiveTableHeaders,
          },
        }
      })

      return (
        <ContentAccordion
          key={index}
          initialExpanded={accordionLength === 1}
          customBarContent={
            <span className={"flex w-full justify-between items-center"}>
              <span className={"flex items-center"}>
                {occupancy?.occupancy > 1
                  ? `${occupancy?.occupancy} ${t("listings.stats.numInHouseholdPlural")}`
                  : `${occupancy?.occupancy} ${t("listings.stats.numInHouseholdSingular")}`}
              </span>
              <span className={"flex items-center mr-2"}>
                {t("listings.incomeRange.minMaxPerMonth", {
                  min: occupancy?.absoluteMinIncome?.toLocaleString(),
                  max: occupancy?.absoluteMaxIncome?.toLocaleString(),
                })}
              </span>
            </span>
          }
          customExpandedContent={
            <div className={"p-4 border-2 border-gray-400 rounded-b-lg"}>
              <CategoryTable categoryData={categoryData} />
            </div>
          }
          accordionTheme={"gray"}
          barClass={"mt-4"}
        />
      )
    }
  )
}

const buildHabitatText = (
  groupedUnitsByOccupancy: GroupedUnitsByOccupancy[],
  amiCharts: RailsAmiChart[]
) => {
  const habitatStringArray = []
  const minAmiChartsValues = amiCharts.find((chart) => {
    return chart.derivedFrom === "MinAmi"
  })?.values

  const maxAmiChartsValues = amiCharts.find((chart) => {
    return chart.derivedFrom === "MaxAmi"
  })?.values

  /*
   * GroupedUnitsByOccupancy() is already sorted
   */
  const minOccupancy = groupedUnitsByOccupancy[0]?.occupancy
  const maxOccupancy = minOccupancy + 9

  /*
   * We want to display 9 rows for Habitat listings
   */
  for (let i = minOccupancy; i < maxOccupancy; i++) {
    const minOccupancyChart = minAmiChartsValues.find((chart) => {
      return chart.numOfHousehold === i
    })

    const maxOccupancyChart = maxAmiChartsValues.find((chart) => {
      return chart.numOfHousehold === i
    })

    if (minOccupancyChart && maxOccupancyChart && i === 1) {
      habitatStringArray.push(
        t("listings.habitat.incomeRange.incomeRangeSingular", {
          number: i,
          minIncome: minOccupancyChart?.amount?.toLocaleString(),
          maxIncome: maxOccupancyChart?.amount?.toLocaleString(),
        })
      )
    }

    if (minOccupancyChart && maxOccupancyChart) {
      habitatStringArray.push(
        t("listings.habitat.incomeRange.incomeRangePlural", {
          number: i,
          minIncome: minOccupancyChart?.amount?.toLocaleString(),
          maxIncome: maxOccupancyChart?.amount?.toLocaleString(),
        })
      )
    }
  }

  return (
    <div className="md:pr-8 md:w-2/3 mx-2 w-full">
      <ul>
        {habitatStringArray.map((habitatString: string, index: number) => {
          return (
            <li key={index}>
              <p>{habitatString}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const buildContent = (
  dataHasBeenFetched: boolean,
  units: RailsUnit[],
  amiCharts: RailsAmiChart[],
  listingIsSale: boolean,
  listingIsHabitat: boolean
) => {
  if (!dataHasBeenFetched) {
    return (
      <div className="flex justify-center md:my-6 md:pr-8 md:px-0 md:w-2/3 px-3 w-full">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  let groupedUnitsByOccupancy: GroupedUnitsByOccupancy[] = []

  if (units?.length) {
    groupedUnitsByOccupancy = groupAndSortUnitsByOccupancy(units, amiCharts)
  }

  if (listingIsHabitat) {
    return buildHabitatText(groupedUnitsByOccupancy, amiCharts)
  }

  return (
    <div className="md:my-6 md:pr-8 md:px-0 md:w-2/3 px-3 w-full">
      {buildAccordions(groupedUnitsByOccupancy, listingIsSale)}
    </div>
  )
}

export const ListingDetailsPricingTable = ({ listing }: ListingDetailsPricingTableProps) => {
  const listingIsSale = isSale(listing)
  const listingIsHabitat = isHabitatListing(listing)
  const {
    fetchedAmiCharts,
    fetchedUnits,
    amiCharts,
    units,
    fetchingAmiChartsError,
    fetchingUnitsError,
  } = useContext(ListingDetailsContext)
  const dataHasBeenFetched = fetchedAmiCharts && fetchedUnits

  useEffect(() => {
    if (fetchingAmiChartsError) {
      // TODO: Log error properly
      throw fetchingAmiChartsError
    }
    if (fetchingUnitsError) {
      // TODO: Log error properly
      throw fetchingUnitsError
    }
  }, [fetchingAmiChartsError, fetchingUnitsError])

  return buildContent(dataHasBeenFetched, units, amiCharts, listingIsSale, listingIsHabitat)
}
