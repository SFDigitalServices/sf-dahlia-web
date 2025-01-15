import React, { Dispatch, SetStateAction } from "react"

import {
  AppearanceSizeType,
  Button,
  Icon,
  IconTypes,
  LinkButton,
  ListingCard,
  PageHeader,
  StackedTableRow,
  t,
} from "@bloom-housing/ui-components"
import dayjs from "dayjs"
import {
  DIRECTORY_SECTION_OPEN_LOTTERIES,
  DIRECTORY_SECTION_ADDITIONAL_LISTINGS,
  DIRECTORY_SECTION_LOTTERY_RESULTS,
  DIRECTORY_SECTION_UPCOMING_LOTTERIES,
  DIRECTORY_SECTION_FCFS_LISTINGS,
} from "../constants"

import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import type RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"
import { getEligibilityEstimatorLink, getHousingCounselorsPath } from "../../util/routeUtil"
import {
  isLotteryComplete,
  getPriorityTypeText,
  isFcfsSalesListing,
  getFcfsSalesListingState,
} from "../../util/listingUtil"
import RailsSaleUnitSummary from "../../api/types/rails/listings/RailsSaleUnitSummary"
import { EligibilityFilters } from "../../api/listingsApiService"
import { renderInlineMarkup } from "../../util/languageUtil"

import { ListingAddress } from "../../components/ListingAddress"
import TextBanner from "../../components/TextBanner"
import { getHabitatContent } from "./HabitatForHumanity"
import { getImageCardProps, RailsListing } from "./SharedHelpers"
import TableSubHeader from "./TableSubHeader"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { ListingState } from "./ListingState"
import { ListingsGroupHeader } from "./ListingsGroupHeader"
import { IconHomeCheck } from "./assets/icon-home-check"
import { EmptyListingsView } from "./components/EmptyListingsView"
import ListingsGroup from "./components/ListingsGroup"

export type RailsUnitSummary = RailsSaleUnitSummary | RailsRentalUnitSummary

export type DirectoryType = "forRent" | "forSale"
export type DirectorySectionType =
  | typeof DIRECTORY_SECTION_OPEN_LOTTERIES
  | typeof DIRECTORY_SECTION_FCFS_LISTINGS
  | typeof DIRECTORY_SECTION_UPCOMING_LOTTERIES
  | typeof DIRECTORY_SECTION_LOTTERY_RESULTS
  | typeof DIRECTORY_SECTION_ADDITIONAL_LISTINGS
export type minMax = "min" | "max"

export type StackedDataFxnType = (listing: RailsRentalListing) => Record<string, StackedTableRow>[]

export interface ListingsGroups {
  open: RailsListing[]
  upcoming: RailsListing[]
  results: RailsListing[]
  additional: RailsListing[]
  fcfs: RailsListing[]
}

type Listing = RailsRentalListing & {
  Reserved_community_type: string
}

const headerClassNames = "text-base text-gray-700 border-b"

const habitatForHumanity = "Habitat for Humanity"

// Transforms an integer or float into a currency string
export const getCurrencyString = (currencyNumber: number) => {
  const fractionDigits = Number.isInteger(currencyNumber) ? 0 : 2
  return currencyNumber || currencyNumber === 0
    ? currencyNumber.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits,
      })
    : null
}

// Transforms a number into a number string, with optional currency formatting
export const getNumberString = (num: number, currency?: boolean) =>
  num || num === 0 ? (currency ? getCurrencyString(num) : num.toLocaleString()) : null

// Return true for 0, but false for null or undefined.
const isNumber = (val: number) => val || val === 0

// Transforms two numbers into a range string with optional currency formatting and optional suffix
// 100, 200, true, null, false --> $100 - $200
// 100, 100, false, "%", false --> 100%
// 100, 100, true, null, true --> $0 - $100
// 0, 100, true, null, true --> $0 - $100
// 0, 100, true, null, false --> Up to $100
export const getRangeString = (
  min: number,
  max: number,
  currency?: boolean,
  suffix?: string,
  forceZeroInRange = false
) => {
  // If min is less than or equal to 0, return "up to {max}"
  // unless the forceZeroInRange arguemtn is true, then we will drop the Up To and just use zero
  if (isNumber(min) && isNumber(max) && min <= 0 && max !== 0 && !forceZeroInRange) {
    const maxString = getNumberString(max, currency)
    return `${t("t.upTo")} ${maxString}`
  }
  // If the numbers differ, return as a range.
  // If the forceZero argument is true then we will ignore the min and just display 0 (only needed for rent as a percent of income listings)
  if (isNumber(min) && isNumber(max) && min !== max) {
    const minString = getNumberString(forceZeroInRange ? 0 : min, currency)
    const maxString = getNumberString(max, currency)
    const range = t("t.numberRange", {
      minValue: minString,
      maxValue: maxString,
    })
    return `${range}${suffix ?? ""}`
  }
  // If a min or max is missing, or they are equal, only return one
  if (isNumber(min) || isNumber(max)) {
    return `${getNumberString(min ?? max, currency)}${suffix ?? ""}`
  }
  // If both numbers are missing, return null
  return null
}

// Gets the rental income range string depending on rent method
export const getRentRangeString = (summary: RailsRentalUnitSummary) => {
  const rentRangeString = getRangeString(summary.minMonthlyRent, summary.maxMonthlyRent, true)
  const percentIncomeRangeString = getRangeString(
    summary.minPercentIncome,
    summary.maxPercentIncome,
    false,
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
export const getPriorityTypes = (listing: RailsRentalListing): string[] | null => {
  if (listing.prioritiesDescriptor && listing.prioritiesDescriptor.length > 0) {
    const priorityNames = []
    listing.prioritiesDescriptor?.forEach((priority) => {
      const text = getPriorityTypeText(priority.name)
      text ? priorityNames.push(text) : priorityNames.push(priority.name)
    })
    return priorityNames
  }
  return null
}

// Get a set of Listing Cards for an array of listings, which includes both the image and summary table
export const getListingCards = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType,
  hasFiltersSet?: boolean
) =>
  listings.map((listing: Listing) => {
    const hasCustomContent = listing.Reserved_community_type === habitatForHumanity
    return (
      <ListingCard
        key={`${listing.Id}`}
        stackedTable={true}
        imageCardProps={getImageCardProps(listing, hasFiltersSet)}
        contentProps={
          hasCustomContent
            ? null
            : {
                tableHeader: { content: getTableHeader(listing) },
                tableSubheader: {
                  content: <TableSubHeader listing={listing} />,
                  isElement: true,
                },
                contentHeader: { content: listing.Name, href: `/listings/${listing.listingID}` },
                contentSubheader: { content: <ListingAddress listing={listing} /> },
              }
        }
        tableProps={
          hasCustomContent
            ? null
            : {
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
              }
        }
        footerButtons={[{ text: t("t.seeDetails"), href: `/listings/${listing.listingID}` }]}
      >
        {hasCustomContent ? getHabitatContent(listing, stackedDataFxn) : null}
      </ListingCard>
    )
  })

export const openListingsView = (
  listings: RailsListing[],
  directoryType: DirectoryType,
  stackedDataFxn: StackedDataFxnType,
  observerRef: React.MutableRefObject<null | IntersectionObserver>,
  filtersSet?: boolean,
  numFcfsListings?: number
) => (
  <ListingsGroupHeader
    title={t(`listings.${directoryType}.openListings.title`)}
    subtitle={t(`listings.${directoryType}.openListings.subtitle`)}
    icon={<Icon size="xlarge" symbol="house" />}
    refKey="enter-a-lottery"
    observerRef={observerRef}
  >
    {listings.length > 0 ? (
      getListingCards(listings, directoryType, stackedDataFxn, filtersSet)
    ) : (
      <EmptyListingsView
        section={DIRECTORY_SECTION_OPEN_LOTTERIES}
        listingsCount={numFcfsListings}
        icon={IconHomeCheck}
      />
    )}
  </ListingsGroupHeader>
)

export const fcfsSalesView = (
  listings: RailsListing[],
  directoryType: DirectoryType,
  stackedDataFxn: StackedDataFxnType,
  observerRef: React.MutableRefObject<null | IntersectionObserver>,
  filtersSet?: boolean,
  numOpenListings?: number
) => (
  <ListingsGroupHeader
    title={t(`listings.${directoryType}.fcfsListings.title`)}
    subtitle={t(`listings.${directoryType}.fcfsListings.subtitle`)}
    icon={IconHomeCheck}
    observerRef={observerRef}
    refKey="buy-now"
  >
    {listings.length > 0 ? (
      getListingCards(listings, directoryType, stackedDataFxn, filtersSet)
    ) : (
      <EmptyListingsView
        section={DIRECTORY_SECTION_FCFS_LISTINGS}
        listingsCount={numOpenListings}
        icon="house"
      />
    )}
  </ListingsGroupHeader>
)

// Get an expandable group of listings
export const getListingGroup = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType,
  header,
  hide,
  show,
  refKey: string,
  observerRef: React.MutableRefObject<null | IntersectionObserver>,
  section: DirectorySectionType,
  hasFiltersSet?: boolean,
  subtitle?: string,
  icon?: IconTypes,
  showListings?: boolean,
  setShowListings?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return (
    <ListingsGroup
      listingsCount={listings.length}
      header={header}
      hideButtonText={hide}
      showButtonText={show}
      info={subtitle}
      icon={icon}
      refKey={refKey}
      observerRef={observerRef}
      showListings={showListings}
      setShowListings={setShowListings}
    >
      {listings.length > 0
        ? getListingCards(listings, directoryType, stackedDataFxn, hasFiltersSet)
        : section !== DIRECTORY_SECTION_ADDITIONAL_LISTINGS && (
            <EmptyListingsView section={section} />
          )}
    </ListingsGroup>
  )
}

export const upcomingLotteriesView = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType,
  observerRef: React.MutableRefObject<null | IntersectionObserver>,
  showListings?: boolean,
  setShowListings?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    t("listings.upcomingLotteries.title"),
    t("listings.upcomingLotteries.hide"),
    t("listings.upcomingLotteries.show"),
    "upcoming-lotteries",
    observerRef,
    DIRECTORY_SECTION_UPCOMING_LOTTERIES,
    undefined,
    t("listings.upcomingLotteries.subtitle"),
    null,
    showListings,
    setShowListings
  )
}

export const lotteryResultsView = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType,
  observerRef: React.MutableRefObject<null | IntersectionObserver>,
  showListings?: boolean,
  setShowListings?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    t("listings.lotteryResults.title"),
    t("listings.lotteryResults.hide"),
    t("listings.lotteryResults.show"),
    "lottery-results",
    observerRef,
    DIRECTORY_SECTION_LOTTERY_RESULTS,
    undefined,
    t("listings.lotteryResults.subtitle"),
    "result",
    showListings,
    setShowListings
  )
}

export const additionalView = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType,
  observerRef: React.MutableRefObject<null | IntersectionObserver>,
  filtersSet?: boolean,
  showListings?: boolean,
  setShowListings?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return (
    listings.length > 0 &&
    getListingGroup(
      listings,
      directoryType,
      stackedDataFxn,
      `${t("listings.additional.title")}`,
      `${t("listings.additional.hide")}`,
      `${t("listings.additional.show")}`,
      "additional-listings",
      observerRef,
      DIRECTORY_SECTION_ADDITIONAL_LISTINGS,
      filtersSet,
      t("listings.additional.subtitle"),
      "doubleHouse",
      showListings,
      setShowListings
    )
  )
}

const sortListingByStringDate = (
  a: RailsListing,
  b: RailsListing,
  fieldName: string,
  acscending = true
) => {
  const dateA = new Date(a[fieldName] as string)
  const dateB = new Date(b[fieldName] as string)

  if (!a[fieldName]) return 1
  if (!b[fieldName]) return -1

  if (acscending) {
    return dateB < dateA ? 1 : -1
  }

  return dateB > dateA ? 1 : -1
}

// Sort listings in four buckets based on their status and filters
export const sortListings = (
  listings: RailsListing[],
  filters: EligibilityFilters,
  setMatch: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const open: RailsListing[] = []
  const upcoming: RailsListing[] = []
  const results: RailsListing[] = []
  const additional: RailsListing[] = []
  const fcfsSalesOpen: RailsListing[] = []
  const fcfsSalesNotYetOpen: RailsListing[] = []
  listings.forEach((listing) => {
    if (isFcfsSalesListing(listing)) {
      const listingState = getFcfsSalesListingState(listing)
      if (listingState === ListingState.Open) {
        fcfsSalesOpen.push(listing)
      } else if (listingState === ListingState.NotYetOpen) {
        fcfsSalesNotYetOpen.push(listing)
      }
    } else if (dayjs(listing.Application_Due_Date) > dayjs()) {
      if (!filters || listing.Does_Match) {
        setMatch(true)
        open.push(listing)
      } else {
        additional.push(listing)
      }
    } else {
      if (isLotteryComplete(listing)) {
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

  fcfsSalesOpen.sort((a: RailsSaleListing, b: RailsSaleListing) =>
    sortListingByStringDate(a, b, "Application_Start_Date_Time", true)
  )
  fcfsSalesNotYetOpen.sort((a: RailsSaleListing, b: RailsSaleListing) =>
    sortListingByStringDate(a, b, "Application_Start_Date_Time", true)
  )

  return {
    open,
    upcoming,
    results,
    additional,
    fcfs: [...fcfsSalesOpen, ...fcfsSalesNotYetOpen],
  } as ListingsGroups
}

export const matchedTextBanner = () => {
  return (
    <TextBanner
      header={`${t("listings.eligibilityCalculator.matched")}`}
      content={`${t("listings.eligibilityCalculator.youMayBeEligible")}`}
    />
  )
}

export const noMatchesTextBanner = (content: string) => {
  return (
    <div className={"listings-group__header"}>
      <div className={"flex px-8 pb-8 max-w-5xl"}>
        <div className={"mt-10 max-w-5xl flex flex-col items-start"}>
          <h2 className={"page-header-subheader"}>{t("listings.noMatches")}</h2>
          <p className={"page-header-text-block"}>{content}</p>
          <p className={"page-header-text-block"}>
            {renderInlineMarkup(
              t("listings.weSuggestHousingCounselor", { url: getHousingCounselorsPath() })
            )}
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
    return filters?.income_timeframe === "per_year" ? t("t.perYear") : t("t.perMonth")
  }

  const getSubHeader = () => {
    const householdSizeContent = t(
      "listings.forHouseholdSize",
      Number.parseInt(filters.household_size)
    )
    const childrenContent = t(
      "listings.includingChildren",
      Number.parseInt(filters.children_under_6)
    )
    const incomeContent = t("listings.atTotalIncome", {
      income: filters.income_total.toLocaleString(),
      per: getYearString(),
    })
    return (
      <>
        {renderInlineMarkup(householdSizeContent, "<span>")}{" "}
        {filters.include_children_under_6 && renderInlineMarkup(childrenContent, "<span>")}{" "}
        {renderInlineMarkup(incomeContent, "<span>")}
      </>
    )
  }
  return (
    <PageHeader title={header}>
      <h2 className={"eligibility-subheader"}>{getSubHeader()}</h2>
      <p className="mt-2 md:mt-4">
        <LinkButton
          href={getEligibilityEstimatorLink()}
          size={AppearanceSizeType.small}
          className={"m-1"}
        >
          {`${t("label.editEligbility")} `}
          <Icon symbol={"arrowDown"} size={"small"} className={"ml-1"} />
        </LinkButton>
        <Button
          className="m-1"
          onClick={() => {
            localStorage.removeItem("ngStorage-eligibility_filters")
            setFilters(null)
          }}
          size={AppearanceSizeType.small}
        >
          {`${t("label.clear")} `}
          <Icon symbol={"close"} size={"small"} className={"ml-1"} />
        </Button>
      </p>
    </PageHeader>
  )
}
