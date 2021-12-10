import React, { useContext, useEffect, useState } from "react"

import {
  ActionBlock,
  ActionBlockLayout,
  Icon,
  ListingsGroup,
  ListingCard,
  LoadingOverlay,
  t,
  StatusBarType,
  ApplicationStatusType,
} from "@bloom-housing/ui-components"

import dayjs from "dayjs"

import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"
import { ConfigContext } from "../../lib/ConfigContext"
import Link from "../../navigation/Link"
import { getAdditionalResourcesPath } from "../../util/routeUtil"
import { areLotteryResultsShareable } from "../../util/listingStatusUtil"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import RailsSaleUnitSummary from "../../api/types/rails/listings/RailsSaleUnitSummary"
import { EligibilityFilters } from "../../api/listingsApiService"

type RailsListing = RailsSaleListing | RailsRentalListing

type RailsUnitSummary = RailsSaleUnitSummary | RailsRentalUnitSummary

type DirectoryType = "forRent" | "forSale"

interface ListingsGroups {
  open: RailsListing[]
  upcoming: RailsListing[]
  results: RailsListing[]
}

interface DirectoryProps {
  listingsAPI: (filters?: EligibilityFilters) => Promise<RailsListing[]>
  directoryType: DirectoryType
}

export const getListingImageCardStatuses = (listing: RailsListing): StatusBarType[] => {
  const statuses: StatusBarType[] = []

  const formattedDueDateString = dayjs(listing.Application_Due_Date).format("MMMM DD, YYYY")
  const lotteryResultsDateString = dayjs(listing.Lottery_Results_Date).format("MMMM DD, YYYY")

  if (new Date(listing.Application_Due_Date) > new Date()) {
    return [
      {
        status: ApplicationStatusType.Open,
        content: `${t("listings.applicationDeadline")}: ${formattedDueDateString}`,
      },
    ]
  } else {
    if (!areLotteryResultsShareable(listing)) {
      statuses.push({
        status: ApplicationStatusType.Closed,
        content: `${t("listings.applicationsClosed")}: ${formattedDueDateString}`,
        hideIcon: true,
      })
    }
    statuses.push({
      status: ApplicationStatusType.PostLottery,
      content: `${t("listings.lotteryResults.cardTitle")}: ${lotteryResultsDateString}`,
      hideIcon: true,
    })
  }

  return statuses
}

export const getNumberString = (currencyNumber: number) =>
  currencyNumber ? currencyNumber.toLocaleString() : null

export const getRangeString = (min: number, max: number, suffix?: string, prefix?: string) => {
  if (min && max && min !== max) {
    const range = t("t.numberRange", {
      minValue: `${prefix ?? ""}${getNumberString(min)}`,
      maxValue: `${prefix ?? ""}${getNumberString(max)}`,
    })
    return `${range}${suffix ?? ""}`
  }
  if (min || max) {
    return `${prefix ?? ""}${getNumberString(min ?? max)}${suffix ?? ""}`
  }
  return null
}

export const getRentRangeString = (summary: RailsRentalUnitSummary) => {
  const rentRangeString = getRangeString(summary.minMonthlyRent, summary.maxMonthlyRent, null, "$")
  const percentIncomeRangeString = getRangeString(
    summary.minPercentIncome,
    summary.maxPercentIncome,
    "%"
  )
  return rentRangeString ?? percentIncomeRangeString ?? ""
}

export const getRentSubText = (summary: RailsRentalUnitSummary) => {
  if (summary?.minMonthlyRent || summary?.maxMonthlyRent) {
    return t("t.perMonth")
  } else if (summary?.minPercentIncome || summary?.maxPercentIncome) {
    return t("t.income")
  }
  return null
}

export const showWaitlist = (listing: RailsListing, summary: RailsUnitSummary) =>
  listing.hasWaitlist && summary.availability <= 0

export const getAvailabilityString = (
  listing: RailsListing,
  summary: RailsUnitSummary,
  mobile?: boolean
) =>
  showWaitlist(listing, summary)
    ? t("t.waitlist")
    : `${summary.availability}${!mobile ? " " + t("t.available") : ""}`

type minMax = "min" | "max"
const getMinMax = (num1: number | null, num2: number | null, rangeType: minMax) => {
  if (num1 && num2) {
    return rangeType === "min" ? Math.min(num1, num2) : Math.max(num1, num2)
  } else {
    return num1 ?? num2
  }
}

const getForRentSummaryTable = (listing: RailsRentalListing) =>
  listing.unitSummaries.general
    .filter((summary) => !!summary.unitType)
    .map((summary) => ({
      unitType: {
        cellText: summary.unitType,
        cellSubText: getAvailabilityString(listing, summary, false),
        hideMobile: true,
      },
      availability: {
        cellText: getAvailabilityString(listing, summary, true),
        cellSubText: showWaitlist(listing, summary) ? null : t("t.available"),
      },
      colThree: {
        cellText: getRangeString(summary.absoluteMinIncome, summary.absoluteMaxIncome, null, "$"),
        cellSubText: t("t.perMonth"),
      },
      colFour: { cellText: getRentRangeString(summary), cellSubText: getRentSubText(summary) },
    }))

const getForSaleSummaryTable = (listing: RailsSaleListing) =>
  listing.unitSummaries.general
    .filter((summary) => !!summary.unitType)
    .map((summary) => ({
      unitType: {
        cellText: summary.unitType,
        cellSubText: getAvailabilityString(listing, summary, false),
        hideMobile: true,
      },
      availability: {
        cellText: getAvailabilityString(listing, summary, true),
        cellSubText: showWaitlist(listing, summary) ? null : t("t.available"),
      },
      colThree: {
        cellText: getRangeString(
          getMinMax(summary.minHoaDuesWithoutParking, summary.minHoaDuesWithParking, "min"),
          getMinMax(summary.maxHoaDuesWithoutParking, summary.maxHoaDuesWithParking, "max"),
          null,
          "$"
        ),
        cellSubText: t("t.perMonth"),
      },
      colFour: {
        cellText: getRangeString(
          getMinMax(summary.minPriceWithoutParking, summary.minPriceWithParking, "min"),
          getMinMax(summary.maxPriceWithoutParking, summary.maxPriceWithParking, "max"),
          null,
          "$"
        ),
      },
    }))

export const getTableHeader = (listing: RailsRentalListing) => {
  let header = null
  if (listing.Units_Available > 0) {
    header = t("listings.availableUnits")
  }
  if (listing.hasWaitlist) {
    header = header ? t("listings.availableUnitsAndOpenWaitlist") : t("listings.openWaitlist")
  }
  return header
}

export const getTableSubHeader = (listing: RailsRentalListing) => {
  if (listing.prioritiesDescriptor && listing.prioritiesDescriptor.length > 0) {
    const priorityNames = listing.prioritiesDescriptor.map((priority) => priority.name)
    // TODO: Translate the priority descriptor names.
    return t("listings.includesPriorityUnits", { priorities: priorityNames.join(", ") })
  }
  return null
}
const headerClassNames = "text-base text-gray-700 border-b"

type Listing = RailsRentalListing & {
  Reserved_community_type: string
}

const getListings = (listings, directoryType) =>
  listings.map((listing: Listing, index) => (
    <ListingCard
      key={index}
      imageCardProps={{
        imageUrl: listing.imageURL,
        subtitle: `${listing.Building_Street_Address}, ${listing.Building_City} ${listing.Building_State}, ${listing.Building_Zip_Code}`,
        title: listing.Name,
        href: `/listings/${listing.listingID}`,
        tagLabel: listing.Reserved_community_type ?? undefined,
        statuses: getListingImageCardStatuses(listing),
      }}
      tableHeaderProps={{
        tableHeader: getTableHeader(listing),
        tableSubHeader: getTableSubHeader(listing),
        stackedTable: true,
      }}
      tableProps={{
        headers: {
          unitType: { name: "t.units", className: headerClassNames },
          availability: { name: "t.available", className: headerClassNames },
          colThree: {
            name: directoryType === "forRent" ? "t.incomeRange" : "saleDirectory.hoaDues",
            className: headerClassNames,
          },
          colFour: {
            name: directoryType === "forRent" ? "t.rent" : "saleDirectory.price",
            className: headerClassNames,
          },
        },
        responsiveCollapse: true,
        cellClassName: "px-5 py-3",
        headersHiddenDesktop: ["availability"],
        stackedData:
          directoryType === "forRent"
            ? getForRentSummaryTable(listing)
            : getForSaleSummaryTable(listing),
      }}
      seeDetailsLink={`/listings/${listing.listingID}`}
    />
  ))

const openListingsView = (listings, directoryType) =>
  listings.length > 0 ? (
    getListings(listings, directoryType)
  ) : (
    <div className="notice-block">
      <h3 className="m-auto text-gray-800">{t("listings.noOpenListings")}</h3>
    </div>
  )

const upcomingLotteriesView = (listings, directoryType) =>
  listings.length > 0 && (
    <ListingsGroup
      listingsCount={listings.length}
      header={t("listings.upcomingLotteries.title")}
      hideButtonText={t("listings.upcomingLotteries.hide")}
      showButtonText={t("listings.upcomingLotteries.show")}
    >
      {getListings(listings, directoryType)}
    </ListingsGroup>
  )

const lotteryResultsView = (listings, directoryType) =>
  listings.length > 0 && (
    <ListingsGroup
      listingsCount={listings.length}
      header={t("listings.lotteryResults.title")}
      hideButtonText={t("listings.lotteryResults.hide")}
      showButtonText={t("listings.lotteryResults.show")}
    >
      {getListings(listings, directoryType)}
    </ListingsGroup>
  )

export const DirectoryPage = (props: DirectoryProps) => {
  const { listingsAlertUrl } = useContext(ConfigContext)
  const [listings, setListings] = useState<ListingsGroups>({ open: [], upcoming: [], results: [] })
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const eligibilityFilters: EligibilityFilters = JSON.parse(
      localStorage.getItem("ngStorage-eligibility_filters")
    )
    void props.listingsAPI(eligibilityFilters).then((listings) => {
      const open = []
      const upcoming = []
      const results = []
      listings.forEach((listing) => {
        if (listing.Does_Match === undefined || listing.Does_Match) {
          if (dayjs(listing.Application_Due_Date) > dayjs()) {
            open.push(listing)
          } else {
            if (areLotteryResultsShareable(listing)) {
              results.push(listing)
            } else {
              upcoming.push(listing)
            }
          }
        }
      })
      open.sort((a: RailsRentalListing, b: RailsRentalListing) =>
        new Date(a.Application_Due_Date) > new Date(b.Application_Due_Date) ? 1 : -1
      )
      upcoming.sort((a: RailsRentalListing, b: RailsRentalListing) =>
        new Date(a.Application_Due_Date) < new Date(b.Application_Due_Date) ? 1 : -1
      )
      results.sort((a: RailsRentalListing, b: RailsRentalListing) =>
        new Date(a.Lottery_Results_Date) < new Date(b.Lottery_Results_Date) ? 1 : -1
      )
      setListings({ open, upcoming, results })
      setLoading(false)
    })
  }, [props])

  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        <div>
          {!loading && (
            <>
              {openListingsView(listings.open, props.directoryType)}
              <div className="bg-primary-darker">
                <div className="max-w-5xl mx-auto p-2 md:p-4">
                  {props.directoryType === "forRent" ? (
                    <ActionBlock
                      header={t("rentalDirectory.callouttitle")}
                      background="primary-darker"
                      layout={ActionBlockLayout.inline}
                      actions={[
                        <Link className="button" key="action-1" href={getAdditionalResourcesPath()}>
                          {t("rentalDirectory.calloutbutton")}
                        </Link>,
                      ]}
                    />
                  ) : (
                    <ActionBlock
                      header={t("saleDirectory.callout.title")}
                      background="primary-darker"
                      layout={ActionBlockLayout.inline}
                      actions={[
                        <Link className="button" key="action-1" href={getAdditionalResourcesPath()}>
                          {t("saleDirectory.callout.firstComeFirstServed")}
                        </Link>,
                        <Link className="button" key="action-2" href={getAdditionalResourcesPath()}>
                          {t("saleDirectory.callout.citySecondLoan")}
                        </Link>,
                      ]}
                    />
                  )}
                </div>
              </div>
              {upcomingLotteriesView(listings.upcoming, props.directoryType)}
              {lotteryResultsView(listings.results, props.directoryType)}
            </>
          )}
        </div>
        <ActionBlock
          header={t("welcome.newListingEmailAlert")}
          background="primary-lighter"
          icon={<Icon size="3xl" symbol="mail" />}
          actions={[
            <Link className="button" key="action-1" href={listingsAlertUrl}>
              {t("welcome.signUpToday")}
            </Link>,
          ]}
        />
      </div>
    </LoadingOverlay>
  )
}

export default DirectoryPage
