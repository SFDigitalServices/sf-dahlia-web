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

import { getRentalListings } from "../api/listingsApiService"
import RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import RailsRentalUnitSummary from "../api/types/rails/listings/RailsRentalUnitSummary"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import { ConfigContext } from "../lib/ConfigContext"
import Link from "../navigation/Link"
import { getAdditionalResourcesPath } from "../util/routeUtil"
import RentalHeader from "./ListingDirectory/RentalHeader"

interface DirectoryProps {
  isRental: boolean
  assetPaths: unknown
}

interface ListingsGroups {
  open: RailsRentalListing[]
  upcoming: RailsRentalListing[]
  results: RailsRentalListing[]
}

export const getListingImageCardStatuses = (listing: RailsRentalListing): StatusBarType[] => {
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
    if (!listing.Publish_Lottery_Results) {
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
    // FIXME: translate this.
    return `${prefix ?? ""}${getNumberString(min)} to ${prefix ?? ""}${getNumberString(max)}${
      suffix ?? ""
    }`
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

export const showWaitlist = (listing: RailsRentalListing, summary: RailsRentalUnitSummary) =>
  listing.hasWaitlist && summary.availability <= 0

export const getAvailabilityString = (
  listing: RailsRentalListing,
  summary: RailsRentalUnitSummary,
  mobile?: boolean
) =>
  showWaitlist(listing, summary)
    ? t("t.waitlist")
    : `${summary.availability}${!mobile ? " " + t("t.available") : ""}`

const getUnitSummaryTable = (listing: RailsRentalListing) =>
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
      income: {
        cellText: getRangeString(summary.absoluteMinIncome, summary.absoluteMaxIncome, null, "$"),
        cellSubText: t("t.perMonth"),
      },
      rent: { cellText: getRentRangeString(summary), cellSubText: getRentSubText(summary) },
    }))

export const getTableHeader = (listing: RailsRentalListing) => {
  let header = null
  if (listing.Units_Available > 0) {
    header = "Available Units"
  }
  if (listing.hasWaitlist) {
    header = header ? `${header} & Open Waitlist` : "Open Waitlist"
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

type Listing = RailsRentalListing & {
  Reserved_community_type: string
}

const getListings = (listings) =>
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
          unitType: "t.units",
          availability: { name: "t.available" },
          income: { name: "t.incomeRange" },
          rent: { name: "t.rent" },
        },
        responsiveCollapse: true,
        cellClassName: "px-5 py-3",
        headersHiddenDesktop: ["availability"],
        stackedData: getUnitSummaryTable(listing),
      }}
      seeDetailsLink={`/listings/${listing.listingID}`}
    />
  ))

const openListingsView = (listings) =>
  listings.length > 0 ? (
    getListings(listings)
  ) : (
    <div className="notice-block">
      <h3 className="m-auto text-gray-800">{t("listings.noOpenListings")}</h3>
    </div>
  )

const upcomingLotteriesView = (listings) =>
  listings.length > 0 && (
    <ListingsGroup
      listingsCount={listings.length}
      header={t("listings.upcomingLotteries.title")}
      hideButtonText={t("listings.upcomingLotteries.hide")}
      showButtonText={t("listings.upcomingLotteries.show")}
    >
      {getListings(listings)}
    </ListingsGroup>
  )

const lotteryResultsView = (listings) =>
  listings.length > 0 && (
    <ListingsGroup
      listingsCount={listings.length}
      header={t("listings.lotteryResults.title")}
      hideButtonText={t("listings.lotteryResults.hide")}
      showButtonText={t("listings.lotteryResults.show")}
    >
      {getListings(listings)}
    </ListingsGroup>
  )

const DirectoryPage = (_props: DirectoryProps) => {
  const { listingsAlertUrl } = useContext(ConfigContext)
  const [listings, setListings] = useState<ListingsGroups>({ open: [], upcoming: [], results: [] })
  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    void getRentalListings().then((listings) => {
      const open = []
      const upcoming = []
      const results = []
      listings.forEach((listing) => {
        if (dayjs(listing.Application_Due_Date) > dayjs()) {
          open.push(listing)
        } else {
          if (listing.Publish_Lottery_Results) {
            results.push(listing)
          } else {
            upcoming.push(listing)
          }
        }
      })
      open.sort((a: RailsRentalListing, b: RailsRentalListing) =>
        new Date(a.Application_Due_Date) > new Date(b.Application_Due_Date) ? 1 : -1
      )
      upcoming.sort((a: RailsRentalListing, b: RailsRentalListing) =>
        new Date(a.Application_Due_Date) > new Date(b.Application_Due_Date) ? 1 : -1
      )
      results.sort((a: RailsRentalListing, b: RailsRentalListing) =>
        new Date(a.Lottery_Results_Date) < new Date(b.Lottery_Results_Date) ? 1 : -1
      )
      setListings({ open, upcoming, results })
      setLoading(false)
    })
  }, [])

  return (
    <LoadingOverlay isLoading={loading}>
      <Layout title={t("pageTitle.rentalListings")}>
        <div>
          {!loading && (
            <>
              <RentalHeader />
              {openListingsView(listings.open)}
              <div className="bg-primary-darker">
                <div className="max-w-5xl mx-auto p-2 md:p-4">
                  <ActionBlock
                    header={t("listingsForRent.callout.title")}
                    background="primary-darker"
                    layout={ActionBlockLayout.inline}
                    actions={[
                      <Link className="button" key="action-1" href={getAdditionalResourcesPath()}>
                        {t("listingsForRent.callout.button")}
                      </Link>,
                    ]}
                  />
                </div>
              </div>
              {upcomingLotteriesView(listings.upcoming)}
              {lotteryResultsView(listings.results)}
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
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(DirectoryPage)
