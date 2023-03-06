import React, { useEffect, useState } from "react"
import { CategoryTable, ContentAccordion, Icon, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isHabitatListing, isSale, classifyPricingDataByOccupancy } from "../../util/listingUtil"
import { getListingPricingTableUnits } from "../../api/listingApiService"
import { RailsListingPricingTableUnit } from "../../api/types/rails/listings/RailsListingPricingTableUnit"

export interface ListingDetailsPricingTableProps {
  listing: RailsListing
}

export interface ListingDetailsPricingTableState {
  units: RailsListingPricingTableUnit[]
  hasFetched: boolean
}

export interface SummaryByAMI {
  unitMaxAMI: number
  summaryByType: RailsListingPricingTableUnit[]
}

export interface MappedUnitsByOccupancy {
  listingID: string
  occupancy: number
  absoluteMinIncome: number
  absoluteMaxIncome: number
  summaryByAMI: SummaryByAMI[]
}

const buildSaleCells = (unitSummary: RailsListingPricingTableUnit) => {
  return {
    units: {
      cellText: unitSummary.unitType,
      cellSubText: `${unitSummary?.availability} ${t("t.available")}`,
    },
    income: {
      cellText: `$${unitSummary.absoluteMinIncome?.toLocaleString()} to $${unitSummary.absoluteMaxIncome?.toLocaleString()}`,
      cellSubText: t("t.perMonth"),
    },
    sale: [
      {
        cellText: `$${unitSummary.maxPriceWithParking?.toLocaleString()}`,
        cellSubText: "with parking",
      },
      {
        cellText: `$${unitSummary.maxPriceWithoutParking?.toLocaleString()}`,
        cellSubText: "without parking",
      },
    ],
    monthlyHoaDues: [
      {
        cellText: `$${unitSummary.maxHoaDuesWithParking?.toLocaleString()}`,
        cellSubText: "with parking",
      },
      {
        cellText: `$${unitSummary.maxHoaDuesWithoutParking?.toLocaleString()}`,
        cellSubText: "without parking",
      },
    ],
  }
}

const buildRentalCells = (unitSummary: RailsListingPricingTableUnit) => {
  return {
    units: {
      cellText: unitSummary.unitType,
      cellSubText: `${unitSummary.availability} ${t("t.available")}`,
    },
    income: {
      cellText: `$${unitSummary.absoluteMinIncome} to $${unitSummary.absoluteMaxIncome}`,
      cellSubText: t("t.perMonth"),
    },
    rent: {
      cellText: `$${unitSummary.maxMonthlyRent}`,
      cellSubText: t("t.perMonth"),
    },
  }
}

const buildAccordions = (units: RailsListingPricingTableUnit[], listingIsSale: boolean) => {
  let mappedUnitsByOccupancy: MappedUnitsByOccupancy[] = []

  if (units?.length) {
    mappedUnitsByOccupancy = classifyPricingDataByOccupancy(units)
  }

  return mappedUnitsByOccupancy?.map(
    (unitsByOccupancy: MappedUnitsByOccupancy, index: number, array) => {
      const accordionLength = array.length
      const categoryData = unitsByOccupancy.summaryByAMI.map((unitsSummaryByAMI: SummaryByAMI) => {
        const responsiveTableRows = unitsSummaryByAMI.summaryByType.map(
          (unitSummary: RailsListingPricingTableUnit) => {
            return listingIsSale ? buildSaleCells(unitSummary) : buildRentalCells(unitSummary)
          }
        )

        const responsiveTableHeaders = listingIsSale
          ? {
              units: { name: "t.unitType" },
              income: { name: "shortFormNav.income" },
              sale: { name: "listings.stats.salesPrice" },
              monthlyHoaDues: { name: "Monthly HOA Dues" },
            }
          : {
              units: { name: "t.unitType" },
              income: { name: "t.incomeRange" },
              rent: { name: "t.rent" },
            }

        return {
          header: t("listings.stats.upToPercentAmi", {
            amiPercent: unitsSummaryByAMI.unitMaxAMI,
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
                {unitsByOccupancy.occupancy > 1
                  ? `${unitsByOccupancy.occupancy} ${t("listings.stats.numInHouseholdPlural")}`
                  : `${unitsByOccupancy.occupancy} ${t("listings.stats.numInHouseholdSingular")}`}
              </span>
              <span className={"flex items-center mr-2"}>
                {t("listings.incomeRange.minMaxPerMonth", {
                  min: unitsByOccupancy.absoluteMinIncome?.toLocaleString(),
                  max: unitsByOccupancy.absoluteMaxIncome?.toLocaleString(),
                })}
              </span>
            </span>
          }
          customExpandedContent={
            <div className={"p-4 border-2 border-gray-400"}>
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
  pricingDataState: ListingDetailsPricingTableState,
  listingIsSale: boolean,
  listingIsHabitat: boolean
) => {
  let mappedUnitsByOccupancy: MappedUnitsByOccupancy[] = []

  if (!pricingDataState.hasFetched) {
    return <Icon symbol="spinner" size="large" />
  }

  if (pricingDataState.units?.length) {
    mappedUnitsByOccupancy = classifyPricingDataByOccupancy(pricingDataState.units)
  }

  if (listingIsSale) {
    return buildAccordions(pricingDataState.units, true)
  }

  if (listingIsHabitat) {
    const habitatStrings = mappedUnitsByOccupancy.map((unitByOccupancy) => {
      return `${
        unitByOccupancy.occupancy
      } people household: $${unitByOccupancy.absoluteMinIncome?.toLocaleString()} to $${unitByOccupancy.absoluteMaxIncome?.toLocaleString()}`
    })

    return (
      <>
        <p>{t("listings.habitat.incomeRange.p4")}</p>
        <ul>
          {habitatStrings.map((habitatString) => {
            return (
              <li>
                <p>{habitatString}</p>
              </li>
            )
          })}
        </ul>
      </>
    )
  }
  return buildAccordions(pricingDataState.units, false)
}

export const ListingDetailsPricingTable = ({ listing }: ListingDetailsPricingTableProps) => {
  const listingIsSale = isSale(listing)
  const listingIsHabitat = isHabitatListing(listing)

  const [pricingDataState, setPricingDataState] = useState<ListingDetailsPricingTableState>({
    units: [],
    hasFetched: false,
  })

  useEffect(() => {
    if (listing.Id) {
      void getListingPricingTableUnits(listing.Id).then((units: RailsListingPricingTableUnit[]) => {
        setPricingDataState({ units, hasFetched: true })
      })
    }

    return () => {
      setPricingDataState({ units: [], hasFetched: false })
    }
  }, [listing.Id])

  return (
    <div
      className={`${
        !pricingDataState.hasFetched ? "flex justify-center" : ""
      } md:my-6 md:pr-8 md:px-0 md:w-2/3 px-3 w-full`}
    >
      {buildContent(pricingDataState, listingIsSale, listingIsHabitat)}
    </div>
  )
}
