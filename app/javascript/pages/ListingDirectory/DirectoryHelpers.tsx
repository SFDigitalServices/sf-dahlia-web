import React, { Dispatch, SetStateAction } from "react"

import {
  ActionBlock,
  Icon,
  ListingsGroup,
  ListingCard,
  t,
  StatusBarType,
  ApplicationStatusType,
  Button,
  PageHeader,
  LinkButton,
  AppearanceSizeType,
} from "@bloom-housing/ui-components"
import dayjs from "dayjs"

import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"
import Link from "../../navigation/Link"
import { getAdditionalResourcesPath } from "../../util/routeUtil"
import { areLotteryResultsShareable } from "../../util/listingStatusUtil"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import RailsSaleUnitSummary from "../../api/types/rails/listings/RailsSaleUnitSummary"
import { EligibilityFilters } from "../../api/listingsApiService"
import { getEligibilityEstimatorLink } from "../../util/routeUtil"
import TextBanner from "./TextBanner"

export type RailsListing = RailsSaleListing | RailsRentalListing

export type RailsUnitSummary = RailsSaleUnitSummary | RailsRentalUnitSummary

export type DirectoryType = "forRent" | "forSale"

export type minMax = "min" | "max"

export interface ListingsGroups {
  open: RailsListing[]
  upcoming: RailsListing[]
  results: RailsListing[]
  additional: RailsListing[]
}

type Listing = RailsRentalListing & {
  Reserved_community_type: string
}

const headerClassNames = "text-base text-gray-700 border-b"

// Returns every status bar under the image card for one listing
export const getListingImageCardStatuses = (listing: RailsListing): StatusBarType[] => {
  const statuses: StatusBarType[] = []
  const formattedDueDateString = dayjs(listing.Application_Due_Date).format("MMMM DD, YYYY")
  const lotteryResultsDateString = dayjs(listing.Lottery_Results_Date).format("MMMM DD, YYYY")

  if (listing.Does_Match) {
    return [
      {
        status: ApplicationStatusType.Open,
        content: `Matched`,
        hideIcon: true,
      },
    ]
  }

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

// Transforms an integer into a currency string
export const getNumberString = (currencyNumber: number) =>
  currencyNumber ? currencyNumber.toLocaleString() : null

// Transforms two numbers into a range string with optional prefix and suffix
// 100, 200, null, "$" --> $100 - $200
// 100, 100, "%" --> 100%
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

// Gets the rental income range string depending on rent method
export const getRentRangeString = (summary: RailsRentalUnitSummary) => {
  const rentRangeString = getRangeString(summary.minMonthlyRent, summary.maxMonthlyRent, null, "$")
  const percentIncomeRangeString = getRangeString(
    summary.minPercentIncome,
    summary.maxPercentIncome,
    "%"
  )
  return rentRangeString ?? percentIncomeRangeString ?? ""
}

// Gets the rental rent subheader depending on rent method
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

// Gets the additional table availability row seen on mobile
// TODO: Remove string concatenation for translations
export const getAvailabilityString = (
  listing: RailsListing,
  summary: RailsUnitSummary,
  mobile?: boolean
) =>
  showWaitlist(listing, summary)
    ? t("t.waitlist")
    : `${summary.availability}${!mobile ? " " + t("t.available") : ""}`

// Get the min or max of two numbers that may be null
export const getMinMax = (num1: number | null, num2: number | null, rangeType: minMax) => {
  if (num1 && num2) {
    return rangeType === "min" ? Math.min(num1, num2) : Math.max(num1, num2)
  } else {
    return num1 ?? num2
  }
}

// Get the summary table header
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

// Get the summary table subheader
export const getTableSubHeader = (listing: RailsRentalListing) => {
  if (listing.prioritiesDescriptor && listing.prioritiesDescriptor.length > 0) {
    const priorityNames = listing.prioritiesDescriptor.map((priority) => priority.name)
    // TODO: Translate the priority descriptor names.
    return t("listings.includesPriorityUnits", { priorities: priorityNames.join(", ") })
  }
  return null
}

// Get a set of Listing Cards for an array of listings, which includes both the image and summary table
export const getListings = (listings, directoryType, stackedDataFxn) =>
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
        stackedData: stackedDataFxn(listing),
      }}
      seeDetailsLink={`/listings/${listing.listingID}`}
    />
  ))

export const openListingsView = (listings, directoryType, stackedDataFxn) =>
  listings.length > 0 && getListings(listings, directoryType, stackedDataFxn)

// Get an expandable group of listings
export const getListingGroup = (listings, directoryType, stackedDataFxn, header, hide, show) => {
  return (
    listings.length > 0 && (
      <ListingsGroup
        listingsCount={listings.length}
        header={header}
        hideButtonText={hide}
        showButtonText={show}
      >
        {getListings(listings, directoryType, stackedDataFxn)}
      </ListingsGroup>
    )
  )
}

export const upcomingLotteriesView = (listings, directoryType, stackedDataFxn) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    t("listings.upcomingLotteries.title"),
    t("listings.upcomingLotteries.hide"),
    t("listings.upcomingLotteries.show")
  )
}

export const lotteryResultsView = (listings, directoryType, stackedDataFxn) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    t("listings.lotteryResults.title"),
    t("listings.lotteryResults.hide"),
    t("listings.lotteryResults.show")
  )
}

export const additionalView = (listings, directoryType, stackedDataFxn) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    "Additional Listings",
    "Hide additional listings",
    "Show additional listings"
  )
}

export const signUpActionBlock = (href: string) => {
  return (
    <ActionBlock
      className={"mt-4"}
      header={t("welcome.newListingEmailAlert")}
      background="primary-lighter"
      icon={<Icon size="3xl" symbol="mail" />}
      actions={[
        <Link className="button" key="action-1" href={href}>
          {t("welcome.signUpToday")}
        </Link>,
      ]}
    />
  )
}

export const housingCounselorActionBlock = () => {
  return (
    <div className={"flex items-center justify-center"}>
      <ActionBlock
        header={
          "For more help, we suggest talking with a housing counselor to explore your options."
        }
        background="primary-lighter"
        actions={[
          <Link className="button" key="action-1" href={"#"}>
            Find a housing counselor
          </Link>,
        ]}
        className={"m-5 p-6 max-w-5xl text-center"}
      />
    </div>
  )
}

// Sort listings in four buckets based on their status and filters
export const sortListings = (
  listings: RailsListing[],
  filters: EligibilityFilters,
  setMatch: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const open = []
  const upcoming = []
  const results = []
  const additional = []
  listings.forEach((listing) => {
    if (dayjs(listing.Application_Due_Date) > dayjs()) {
      if (!filters || listing.Does_Match) {
        setMatch(true)
        open.push(listing)
      } else {
        additional.push(listing)
      }
    } else {
      if (areLotteryResultsShareable(listing)) {
        results.push(listing)
      } else {
        upcoming.push(listing)
      }
    }
  })
  open.sort((a: RailsRentalListing, b: RailsRentalListing) =>
    new Date(a.Application_Due_Date) > new Date(b.Application_Due_Date) ? 1 : -1
  )
  additional.sort((a: RailsRentalListing, b: RailsRentalListing) =>
    new Date(a.Application_Due_Date) > new Date(b.Application_Due_Date) ? 1 : -1
  )
  upcoming.sort((a: RailsRentalListing, b: RailsRentalListing) =>
    new Date(a.Application_Due_Date) < new Date(b.Application_Due_Date) ? 1 : -1
  )
  results.sort((a: RailsRentalListing, b: RailsRentalListing) =>
    new Date(a.Lottery_Results_Date) < new Date(b.Lottery_Results_Date) ? 1 : -1
  )
  return { open, upcoming, results, additional }
}

export const matchedTextBanner = () => {
  return (
    <TextBanner
      header={"Matched"}
      content={
        "Based on information you entered, you may be eligible for units at the following property."
      }
    />
  )
}

export const noMatchesTextBanner = (content: string) => {
  return (
    <div className={"flex justify-center"}>
      <div className={"flex px-8 pb-8 max-w-5xl"}>
        <div className={"mt-10 max-w-5xl flex flex-col items-start match-container"}>
          <h2 className={"page-header-subheader"}>No Matches</h2>
          <p className={"page-header-text-block"}>{content}</p>
          <p className={"page-header-text-block"}>
            <Link href={getAdditionalResourcesPath()}>Click here</Link> for other rental and
            ownership affordable housing opportunities.
          </p>
        </div>
      </div>
    </div>
  )
}

export const eligibilityHeader = (
  filters: EligibilityFilters,
  setFilters: Dispatch<SetStateAction<EligibilityFilters>>,
  header: string
) => {
  const getYearString = () => {
    return filters?.income_timeframe === "per_year" ? "per year" : "per month"
  }
  return (
    <PageHeader title={header}>
      <h2 className={"eligibility-subheader"}>
        for <span className={"eligibility-subtext"}>{filters.household_size}</span> people at{" "}
        <span className={"eligibility-subtext"}>${filters.income_total.toLocaleString()}</span>{" "}
        {getYearString()}
      </h2>
      <p className="mt-2 md:mt-4">
        <LinkButton
          href={getEligibilityEstimatorLink()}
          size={AppearanceSizeType.small}
          className={"mr-1"}
        >
          Edit Eligibility <Icon symbol={"arrowDown"} size={"small"} className={"ml-1"} />
        </LinkButton>
        <Button
          onClick={() => {
            localStorage.removeItem("ngStorage-eligibility_filters")
            setFilters(null)
          }}
          size={AppearanceSizeType.small}
        >
          Clear <Icon symbol={"close"} size={"small"} className={"ml-1"} />
        </Button>
      </p>
    </PageHeader>
  )
}
