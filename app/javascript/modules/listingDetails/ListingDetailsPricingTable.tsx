import React, { useEffect, useState } from "react"
import { CategoryTable, ContentAccordion, Icon, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isHabitatListing, isSale, classifyPricingDataByOccupancy } from "../../util/listingUtil"
import { getListingPricingTableUnits } from "../../api/listingApiService"
import { RailsListingPricingTableUnit } from "../../api/types/rails/listings/RailsListingPricingTableUnit"

export interface ListingDetailsPricingTableProps {
  listing: RailsListing
}

export interface PricingDataState {
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

export const ListingDetailsPricingTable = ({ listing }: ListingDetailsPricingTableProps) => {
  const listingIsSale = isSale(listing)

  const responsiveTableHeaders = isSale
    ? {
        units: { name: "t.unitType" },
        income: { name: "t.incomeRange" },
        sale: { name: "listings.stats.salesPrice" },
        monthlyHoaDues: { name: "Monthly HOA Dues" },
      }
    : {
        units: { name: "t.unitType" },
        income: { name: "t.incomeRange" },
        rent: { name: "t.rent" },
      }

  const [pricingData, setPricingData] = useState<PricingDataState>({
    units: [],
    hasFetched: false,
  })

  let mappedUnitsByOccupancy: MappedUnitsByOccupancy[] = []

  useEffect(() => {
    if (listing.Id) {
      void getListingPricingTableUnits(listing.Id).then((units: RailsListingPricingTableUnit[]) => {
        setPricingData({ units, hasFetched: true })
      })
    }

    return () => {
      setPricingData({ units: [], hasFetched: false })
    }
  }, [listing.Id])

  if (pricingData.units?.length) {
    mappedUnitsByOccupancy = classifyPricingDataByOccupancy(pricingData.units)
  }
  console.log(pricingData)

  const pricingTableAccordions = mappedUnitsByOccupancy?.map(
    (unitsByOccupancy: MappedUnitsByOccupancy, index) => {
      const categoryData = unitsByOccupancy.summaryByAMI.map((unitsSummaryByAMI: SummaryByAMI) => {
        const responsiveTableRows = unitsSummaryByAMI.summaryByType.map(
          (unitSummary: RailsListingPricingTableUnit) => {
            return listingIsSale
              ? {
                  units: {
                    cellText: unitSummary.unitType,
                    cellSubText: `${unitSummary.availability} ${t("t.available")}`,
                  },
                  income: {
                    cellText: `$${unitSummary.absoluteMinIncome} to $${unitSummary.absoluteMaxIncome}`,
                    cellSubText: t("t.perMonth"),
                  },
                  sale: {
                    cellText: `$${unitSummary.maxPriceWithParking}`,
                    cellSubText: t("t.perMonth"),
                  },
                  monthlyHoaDues: {
                    cellText: `$${unitSummary.maxPriceWithParking}`,
                    cellSubText: t("t.perMonth"),
                  },
                }
              : {
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
        )
        return {
          header: t("listings.stats.upToPercentAmi", { amiPercent: unitsSummaryByAMI.unitMaxAMI }),
          tableData: {
            stackedData: responsiveTableRows,
            headers: responsiveTableHeaders,
          },
        }
      })

      return (
        <ContentAccordion
          key={index}
          customBarContent={
            <span className={"flex w-full justify-between items-center"}>
              <span className={"flex items-center"}>
                {unitsByOccupancy.occupancy > 1
                  ? `${unitsByOccupancy.occupancy} ${t("listings.stats.numInHouseholdPlural")}`
                  : `${unitsByOccupancy.occupancy} ${t("listings.stats.numInHouseholdSingular")}`}
              </span>
              <span className={"flex items-center mr-2"}>
                {`Income $${unitsByOccupancy.absoluteMinIncome} ${t("t.to")} $${
                  unitsByOccupancy.absoluteMaxIncome
                } ${t("t.perMonth")}`}
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

  if (!pricingData.hasFetched) {
    return (
      <div className="flex justify-center md:my-6 md:pr-8 md:px-0 md:w-2/3 px-3 w-full">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  if (isHabitatListing(listing)) return null

  return (
    <div className="md:my-6 md:pr-8 md:px-0 md:w-2/3 px-3 w-full">{pricingTableAccordions}</div>
  )
}
