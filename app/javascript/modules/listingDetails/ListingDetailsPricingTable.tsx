import React, { useContext, useEffect } from "react"
import { CategoryTable, ContentAccordion, Icon, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isHabitatListing, isSale, groupAndSortUnitsByOccupancy } from "../../util/listingUtil"
import type { RailsUnitWithOccupancyAndMinMaxIncome } from "../../api/types/rails/listings/RailsUnit"
import type RailsUnit from "../../api/types/rails/listings/RailsUnit"
import type { RailsAmiChart } from "../../api/types/rails/listings/RailsAmiChart"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"
import { getCurrencyString, getRangeString } from "../listings/DirectoryHelpers"
import { defaultIfNotTranslated, renderInlineMarkup } from "../../util/languageUtil"
import "./ListingDetailsPricingTable.scss"

export interface ListingDetailsPricingTableProps {
  listing: RailsListing
}

export interface AmiRow {
  ami: { min: number | undefined; max: number }
  units: RailsUnitWithOccupancyAndMinMaxIncome[]
}

export interface GroupedUnitsByOccupancy {
  occupancy: number
  absoluteMinIncome: number
  absoluteMaxIncome: number
  amiRows: AmiRow[]
}

const buildSalePriceCellRow = (unit: RailsUnitWithOccupancyAndMinMaxIncome) => {
  if (unit.Price_With_Parking && unit.Price_Without_Parking) {
    return [
      {
        cellText: String(unit.Price_With_Parking),
        cellSubText: t("listings.stats.withParking"),
      },
      {
        cellText: String(unit.Price_Without_Parking),
        cellSubText: t("listings.stats.withoutParking"),
      },
    ]
  }

  if (unit.Price_With_Parking && !unit.Price_Without_Parking) {
    return [
      {
        cellText: String(unit.Price_With_Parking),
        cellSubText: t("listings.stats.withParking"),
      },
    ]
  }

  if (!unit.Price_With_Parking && unit.Price_Without_Parking) {
    return [
      {
        cellText: String(unit.Price_Without_Parking),
        cellSubText: t("listings.stats.withoutParking"),
      },
    ]
  }
}

const buildSaleHoaDuesCellRow = (unit: RailsUnitWithOccupancyAndMinMaxIncome) => {
  if (unit?.HOA_Dues_With_Parking && unit?.HOA_Dues_Without_Parking) {
    return [
      {
        cellText: String(unit.HOA_Dues_With_Parking),
        cellSubText: t("listings.stats.withParking"),
      },
      {
        cellText: String(unit.HOA_Dues_Without_Parking),
        cellSubText: t("listings.stats.withoutParking"),
      },
    ]
  }

  if (unit?.HOA_Dues_With_Parking && !unit?.HOA_Dues_Without_Parking) {
    return [
      {
        cellText: String(unit.HOA_Dues_With_Parking),
        cellSubText: t("listings.stats.withParking"),
      },
    ]
  }

  if (!unit?.HOA_Dues_With_Parking && unit?.HOA_Dues_Without_Parking) {
    return [
      {
        cellText: String(unit.HOA_Dues_Without_Parking),
        cellSubText: t("listings.stats.withoutParking"),
      },
    ]
  }
}

const buildSaleCells = (unit: RailsUnitWithOccupancyAndMinMaxIncome) => {
  return {
    units: {
      cellText: defaultIfNotTranslated(`listings.unitTypes.${unit.Unit_Type}`, unit.Unit_Type),
      cellSubText: `${unit?.Availability} ${t("t.available")}`,
    },
    income: {
      cellText: getRangeString(unit?.minMonthlyIncomeNeeded, unit?.maxMonthlyIncomeNeeded, true),
      cellSubText: t("t.perMonth"),
    },
    sale: buildSalePriceCellRow(unit),
    monthlyHoaDues: buildSaleHoaDuesCellRow(unit),
  }
}

const buildRentalCells = (unit: RailsUnitWithOccupancyAndMinMaxIncome) => {
  return {
    units: {
      cellText: defaultIfNotTranslated(`listings.unitTypes.${unit.Unit_Type}`, unit.Unit_Type),
      cellSubText: `${unit.Availability} ${t("t.available")}`,
    },
    income: {
      cellText: getRangeString(
        unit?.minMonthlyIncomeNeeded,
        unit?.maxMonthlyIncomeNeeded,
        true,
        undefined,
        !!unit?.Rent_percent_of_income
      ),
      cellSubText: t("t.perMonth"),
    },
    rent: {
      cellText: unit?.BMR_Rent_Monthly
        ? getCurrencyString(Math.round(unit?.BMR_Rent_Monthly))
        : `${unit?.Rent_percent_of_income}%`,
      cellSubText: unit?.BMR_Rent_Monthly ? t("t.perMonth") : t("t.income"),
    },
  }
}

const buildHeader = (amiRow: AmiRow, showFullText: boolean): string => {
  const fullText: string = showFullText ? ".fullText" : ""
  return amiRow.ami.min
    ? t("listings.stats.amiRange".concat(fullText), {
        minAmiPercent: amiRow.ami.min,
        maxAmiPercent: amiRow.ami.max,
      })
    : t("listings.stats.upToPercentAmi".concat(fullText), {
        amiPercent: amiRow.ami.max,
      })
}

const buildAccordions = (
  groupedUnitsByOccupancy: GroupedUnitsByOccupancy[],
  listingIsSale: boolean,
  forceZeroInRange: boolean
) => {
  return groupedUnitsByOccupancy?.map(
    (occupancy: GroupedUnitsByOccupancy, index: number, array) => {
      const accordionLength = array.length

      const categoryData = occupancy?.amiRows?.map((amiRow: AmiRow, amiRowIndex: number) => {
        const responsiveTableRows = amiRow.units.map(
          (unit: RailsUnitWithOccupancyAndMinMaxIncome) => {
            return listingIsSale ? buildSaleCells(unit) : buildRentalCells(unit)
          }
        )

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

        // only add the AMI full text on the first accordion
        const header: string = buildHeader(amiRow, amiRowIndex === 0)

        return {
          header,
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
            <span
              className={
                "flex md:flex-row flex-col w-full justify-between items-start md:items-center"
              }
            >
              <span className={"flex items-center whitespace-pre-wrap"}>
                <span className={"text-sm md:text-2xl leading-8 font-semibold md:font-normal"}>
                  {`${occupancy?.occupancy} `}
                </span>
                <span className="text-sm md:text-base text-left">
                  {occupancy?.occupancy > 1
                    ? `${t("listings.stats.numInHouseholdPlural")}`
                    : `${t("listings.stats.numInHouseholdSingular")}`}
                </span>
              </span>
              <span
                className={"flex items-center mr-2 text-sm md:text-base text-left md:text-center"}
              >
                {(() => {
                  return occupancy?.absoluteMinIncome <= 0 && !forceZeroInRange ? (
                    <div>
                      {renderInlineMarkup(
                        t("listings.incomeRange.upToMaxPerMonth", {
                          max: occupancy?.absoluteMaxIncome?.toLocaleString(),
                        }),
                        "<span>"
                      )}
                    </div>
                  ) : (
                    <div>
                      {renderInlineMarkup(
                        t("listings.incomeRange.minMaxPerMonth", {
                          min: Math.round(
                            forceZeroInRange ? 0 : occupancy?.absoluteMinIncome
                          ).toLocaleString(),
                          max: Math.round(occupancy?.absoluteMaxIncome).toLocaleString(),
                        }),
                        "<span>"
                      )}
                    </div>
                  )
                })()}
              </span>
            </span>
          }
          customExpandedContent={
            <div
              className={`p-4 border-2 border-gray-400 rounded-b-lg${listingIsSale ? " sale" : ""}`}
            >
              <CategoryTable categoryData={categoryData} />
            </div>
          }
          accordionTheme={"gray"}
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

    if (minOccupancyChart && maxOccupancyChart) {
      habitatStringArray.push(
        t("listings.habitat.incomeRange", {
          smart_count: i,
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

  const forceZeroInRange = units?.some((unit) => unit.Rent_percent_of_income)

  let groupedUnitsByOccupancy: GroupedUnitsByOccupancy[] = []

  if (units?.length) {
    groupedUnitsByOccupancy = groupAndSortUnitsByOccupancy(units, amiCharts, listingIsSale)
  }

  if (listingIsHabitat) {
    return buildHabitatText(groupedUnitsByOccupancy, amiCharts)
  }

  return (
    <div className="md:my-6 md:pr-8 sm:px-4 lg:pl-0 lg:pr-8 md:w-2/3 px-2 w-full">
      {buildAccordions(groupedUnitsByOccupancy, listingIsSale, forceZeroInRange)}
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
