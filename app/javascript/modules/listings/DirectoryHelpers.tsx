import React, { Dispatch, SetStateAction } from "react"

import {
  AppearanceSizeType,
  Button,
  Icon,
  IconTypes,
  LinkButton,
  ListingCard,
  ListingsGroup,
  PageHeader,
  StackedTableRow,
  t,
} from "@bloom-housing/ui-components"
import dayjs from "dayjs"

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

export type RailsUnitSummary = RailsSaleUnitSummary | RailsRentalUnitSummary

export type DirectoryType = "forRent" | "forSale"

export type minMax = "min" | "max"

export type StackedDataFxnType = (listing: RailsRentalListing) => Record<string, StackedTableRow>[]

export interface ListingsGroups {
  open: RailsListing[]
  upcoming: RailsListing[]
  results: RailsListing[]
  additional: RailsListing[]
  fcfsSalesOpen: RailsListing[]
  fcfsSalesNotYetOpen: RailsListing[]
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
  filtersSet?: boolean
) =>
  listings.length > 0 && (
    <>
      <ListingsGroupHeader
        title={t(`listings.${directoryType}.openListings.title`)}
        subtitle={t(`listings.${directoryType}.openListings.subtitle`)}
        icon={<Icon size="large" symbol="house" />}
      />
      {getListingCards(listings, directoryType, stackedDataFxn, filtersSet)}
    </>
  )

export const fcfsSalesView = (
  listings: RailsListing[],
  directoryType: DirectoryType,
  stackedDataFxn: StackedDataFxnType,
  filtersSet?: boolean
) =>
  listings.length > 0 && (
    <>
      <ListingsGroupHeader
        title={t(`listings.${directoryType}.fcfsListings.title`)}
        subtitle={t(`listings.${directoryType}.fcfsListings.subtitle`)}
        icon={
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M17.382 5.86506C17.6945 5.56635 18.2171 5.56727 18.5265 5.86416C18.2171 5.56727 17.6951 5.56582 17.3825 5.86453L6.1856 16.613L17.382 5.86506ZM18.249 24.1118C18.2604 24.0581 18.2721 24.0045 18.2842 23.9511L18.2885 23.9323C18.2749 23.9919 18.2617 24.0518 18.249 24.1118ZM17.1752 5.64766C17.6037 5.2381 18.3088 5.23943 18.7342 5.64772L28.2351 14.767C28.651 14.7226 29.0733 14.6999 29.5008 14.6999C29.9032 14.6999 30.301 14.7201 30.6932 14.7594L19.9167 4.41572C18.8295 3.37218 17.0814 3.37306 15.9934 4.41499L15.9926 4.41575L0.563329 19.227C0.223139 19.5536 0.212094 20.0941 0.538659 20.4343C0.865225 20.7745 1.40574 20.7855 1.74593 20.459L4.17791 18.1244V32.868C4.17791 34.398 5.46064 35.5826 6.97032 35.5826H21.9674C21.352 35.0716 20.7893 34.4992 20.2889 33.8749H14.9323V26.6656C14.9323 26.148 15.3796 25.6588 16.017 25.6588H17.7303C17.7713 25.077 17.8545 24.5067 17.9769 23.9511H16.017C14.5073 23.9511 13.2246 25.1356 13.2246 26.6656V33.8749H6.97032C6.33298 33.8749 5.8856 33.3856 5.8856 32.868V16.4851L17.1752 5.64766ZM24.2274 20.8388C25.6833 19.3829 27.658 18.565 29.717 18.565C31.776 18.565 33.7506 19.3829 35.2066 20.8388C36.6625 22.2948 37.4804 24.2694 37.4804 26.3284C37.4804 27.348 37.2796 28.3575 36.8895 29.2994C36.4993 30.2413 35.9275 31.0971 35.2066 31.818C34.4857 32.5389 33.6298 33.1108 32.6879 33.501C31.746 33.8911 30.7365 34.0919 29.717 34.0919C28.6974 34.0919 27.6879 33.8911 26.746 33.501C25.8041 33.1108 24.9483 32.5389 24.2274 31.818C23.5064 31.0971 22.9346 30.2413 22.5444 29.2994C22.1543 28.3575 21.9535 27.348 21.9535 26.3284C21.9535 24.2694 22.7714 22.2948 24.2274 20.8388ZM28.8853 28.1016L27.3121 26.5283C27.0165 26.2327 26.5372 26.2327 26.2415 26.5283C25.9459 26.8239 25.9459 27.3032 26.2415 27.5989L28.4466 29.804C28.604 29.9613 28.8226 30.0415 29.0444 30.0231C29.2661 30.0048 29.4686 29.8898 29.5979 29.7087L33.2731 24.5634C33.5161 24.2232 33.4373 23.7504 33.0971 23.5074C32.7569 23.2644 32.2841 23.3432 32.0411 23.6834L28.8853 28.1016ZM29.717 16.751C27.1769 16.751 24.7408 17.76 22.9447 19.5562C21.1485 21.3523 20.1395 23.7883 20.1395 26.3284C20.1395 27.5862 20.3872 28.8316 20.8685 29.9936C21.3498 31.1556 22.0553 32.2114 22.9447 33.1007C23.834 33.9901 24.8898 34.6956 26.0518 35.1769C27.2138 35.6582 28.4592 35.9059 29.717 35.9059C30.9747 35.9059 32.2201 35.6582 33.3821 35.1769C34.5441 34.6956 35.5999 33.9901 36.4892 33.1007C37.3786 32.2114 38.0841 31.1556 38.5654 29.9936C39.0467 28.8316 39.2944 27.5862 39.2944 26.3284C39.2944 23.7883 38.2854 21.3523 36.4892 19.5562C34.6931 17.76 32.2571 16.751 29.717 16.751Z"
              fill="black"
            />
          </svg>
        }
      />
      {getListingCards(listings, directoryType, stackedDataFxn, filtersSet)}
    </>
  )

// Get an expandable group of listings
export const getListingGroup = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType,
  header,
  hide,
  show,
  hasFiltersSet?: boolean,
  subtitle?: string,
  icon?: IconTypes
) => {
  return (
    listings.length > 0 && (
      <ListingsGroup
        listingsCount={listings.length}
        header={header}
        hideButtonText={hide}
        showButtonText={show}
        info={subtitle}
        icon={icon}
      >
        {getListingCards(listings, directoryType, stackedDataFxn, hasFiltersSet)}
      </ListingsGroup>
    )
  )
}

export const upcomingLotteriesView = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType
) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    t("listings.upcomingLotteries.title"),
    t("listings.upcomingLotteries.hide"),
    t("listings.upcomingLotteries.show"),
    undefined,
    t("listings.upcomingLotteries.subtitle")
  )
}

export const lotteryResultsView = (listings, directoryType, stackedDataFxn: StackedDataFxnType) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    t("listings.lotteryResults.title"),
    t("listings.lotteryResults.hide"),
    t("listings.lotteryResults.show"),
    undefined,
    t("listings.lotteryResults.subtitle"),
    "result"
  )
}

export const additionalView = (
  listings,
  directoryType,
  stackedDataFxn: StackedDataFxnType,
  filtersSet?: boolean
) => {
  return getListingGroup(
    listings,
    directoryType,
    stackedDataFxn,
    `${t("listings.additional.title")}`,
    `${t("listings.additional.hide")}`,
    `${t("listings.additional.show")}`,
    filtersSet,
    t("listings.additional.subtitle"),
    "doubleHouse"
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

  // uncomment to see the listings order in the console

  // console.log("FCFS Open Listings")
  // fcfsSalesOpen.map((listing) =>
  //   console.log(`Name: ${listing.Name} ${listing.Application_Start_Date_Time}`)
  // )

  // console.log("FCFS Not Yet Open Listings")
  // fcfsSalesNotYetOpen.map((listing) =>
  //   console.log(`Name: ${listing.Name} ${listing.Application_Start_Date_Time}`)
  // )

  return {
    open,
    upcoming,
    results,
    additional,
    fcfsSalesOpen,
    fcfsSalesNotYetOpen,
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
