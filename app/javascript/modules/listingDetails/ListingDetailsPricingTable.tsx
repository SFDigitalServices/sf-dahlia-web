import React, { useContext } from "react"
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
  units: RailsUnit[],
  listingIsSale: boolean,
  amiCharts: RailsAmiChart[]
) => {
  let groupedUnitsByOccupancy: GroupedUnitsByOccupancy[] = []

  if (units?.length) {
    groupedUnitsByOccupancy = groupAndSortUnitsByOccupancy(units, amiCharts)
  }

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

const buildContent = (
  dataHasBeenFetched: boolean,
  units: RailsUnit[],
  amiCharts: RailsAmiChart[],
  listingIsSale: boolean,
  listingIsHabitat: boolean
) => {
  if (!dataHasBeenFetched) {
    return <Icon symbol="spinner" size="large" />
  }

  if (listingIsSale && !listingIsHabitat) {
    return buildAccordions(units, true, amiCharts)
  }

  if (listingIsHabitat) {
    return ""
    // if (units?.length) {
    //   groupedUnitsByOccupancy = groupAndSortUnitsByOccupancy(units, amiCharts)
    // }
    // const habitatStrings = groupedUnitsByOccupancy.map((unitByOccupancy) => {
    //   return `${
    //     unitByOccupancy.occupancy
    //   } people household: $${unitByOccupancy.absoluteMinIncome?.toLocaleString()} to $${unitByOccupancy.absoluteMaxIncome?.toLocaleString()}`
    // })

    // return (
    //   <>
    //     <p>{t("listings.habitat.incomeRange.p4")}</p>
    //     <ul>
    //       {habitatStrings.map((habitatString) => {
    //         return (
    //           <li>
    //             <p>{habitatString}</p>
    //           </li>
    //         )
    //       })}
    //     </ul>
    //   </>
    // )
  }
  return buildAccordions(units, false, amiCharts)
}

export const ListingDetailsPricingTable = ({ listing }: ListingDetailsPricingTableProps) => {
  const listingIsSale = isSale(listing)
  const listingIsHabitat = isHabitatListing(listing)
  const { fetchedAmiCharts, fetchedUnits, amiCharts, units } = useContext(ListingDetailsContext)
  const dataHasBeenFetched = fetchedAmiCharts && fetchedUnits

  return (
    <div
      className={`${
        !dataHasBeenFetched ? "flex justify-center" : ""
      } md:my-6 md:pr-8 md:px-0 md:w-2/3 px-3 w-full`}
    >
      {buildContent(dataHasBeenFetched, units, amiCharts, listingIsSale, listingIsHabitat)}
    </div>
  )
}
