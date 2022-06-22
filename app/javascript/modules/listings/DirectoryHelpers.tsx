import React, { Dispatch, SetStateAction } from "react"

import {
  ActionBlock,
  AppearanceSizeType,
  Button,
  Icon,
  IconTypes,
  LinkButton,
  ListingCard,
  ListingsGroup,
  PageHeader,
  t,
} from "@bloom-housing/ui-components"
import dayjs from "dayjs"

import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import RailsRentalUnitSummary from "../../api/types/rails/listings/RailsRentalUnitSummary"
import Link from "../../navigation/Link"
import { getEligibilityEstimatorLink, getHousingCounselorsPath } from "../../util/routeUtil"
import { areLotteryResultsShareable } from "../../util/listingUtil"
import RailsSaleUnitSummary from "../../api/types/rails/listings/RailsSaleUnitSummary"
import { EligibilityFilters } from "../../api/listingsApiService"
import { renderInlineWithInnerHTML } from "../../util/languageUtil"

import { ListingAddress } from "../../components/ListingAddress"
import TextBanner from "../../components/TextBanner"
import { getHabitatContent } from "./HabitatForHumanity"
import { getImageCardProps, RailsListing } from "./SharedHelpers"

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
// 100, 200, true, null --> $100 - $200
// 100, 100, false, "%" --> 100%
export const getRangeString = (min: number, max: number, currency?: boolean, suffix?: string) => {
  // If the numbers differ, return as a range.
  if (isNumber(min) && isNumber(max) && min !== max) {
    const minString = getNumberString(min, currency)
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
export const getTableSubHeader = (listing: RailsRentalListing) => {
  if (listing.prioritiesDescriptor && listing.prioritiesDescriptor.length > 0) {
    const priorityNames = []
    listing.prioritiesDescriptor.forEach((priority) => {
      switch (priority.name) {
        case "Vision impairments":
          priorityNames.push(t("listings.prioritiesDescriptor.vision"))
          break
        case "Hearing impairments":
          priorityNames.push(t("listings.prioritiesDescriptor.hearing"))
          break
        case "Hearing/Vision impairments":
          priorityNames.push(t("listings.prioritiesDescriptor.hearingVision"))
          break
        case "Mobility/hearing/vision impairments":
          priorityNames.push(t("listings.prioritiesDescriptor.mobilityHearingVision"))
          break
        case "Mobility impairments":
          priorityNames.push(t("listings.prioritiesDescriptor.mobility"))
          break
        default:
          priorityNames.push(priority.name)
      }
    })

    return t("listings.includesPriorityUnits", { priorities: priorityNames.join(", ") })
  }
  return null
}

// Get a set of Listing Cards for an array of listings, which includes both the image and summary table
export const getListingCards = (listings, directoryType, stackedDataFxn, hasFiltersSet?: boolean) =>
  listings.map((listing: Listing, index) => {
    const hasCustomContent = listing.Reserved_community_type === habitatForHumanity
    return (
      <ListingCard
        key={index}
        stackedTable={true}
        imageCardProps={getImageCardProps(listing, hasFiltersSet)}
        contentProps={
          hasCustomContent
            ? null
            : {
                tableHeader: { content: getTableHeader(listing) },
                tableSubheader: { content: getTableSubHeader(listing) },
                contentHeader: { content: listing.Name },
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

export const openListingsView = (listings, directoryType, stackedDataFxn, filtersSet?) =>
  listings.length > 0 && getListingCards(listings, directoryType, stackedDataFxn, filtersSet)

// Get an expandable group of listings
export const getListingGroup = (
  listings,
  directoryType,
  stackedDataFxn,
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

export const upcomingLotteriesView = (listings, directoryType, stackedDataFxn) => {
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

export const lotteryResultsView = (listings, directoryType, stackedDataFxn) => {
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

export const additionalView = (listings, directoryType, stackedDataFxn, filtersSet?: boolean) => {
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

export const signUpActionBlock = (href: string) => {
  return (
    <ActionBlock
      className={"mt-4"}
      header={t("welcome.newListingEmailAlert")}
      background="primary-lighter"
      icon={<Icon size="3xl" symbol="mailThin" fill="transparent" />}
      actions={[
        <Link className="button" key="action-1" external={true} href={href}>
          {t("welcome.signUpToday")}
        </Link>,
      ]}
    />
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
            {renderInlineWithInnerHTML(
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
    const householdSizeContent = t("listings.forHouseholdSize", {
      size: filters.household_size,
      people: filters.household_size === "1" ? t("listings.person") : t("listings.people"),
    })
    const childrenContent = ` ${t("listings.includingChildren", {
      number: filters.children_under_6,
      children: filters.children_under_6 === "1" ? t("t.child") : t("t.children"),
    })}`
    const incomeContent = ` ${t("listings.atTotalIncome", {
      income: filters.income_total.toLocaleString(),
      per: getYearString(),
    })}`
    return (
      <>
        {renderInlineWithInnerHTML(householdSizeContent)}
        {filters.include_children_under_6 && renderInlineWithInnerHTML(childrenContent)}
        {renderInlineWithInnerHTML(incomeContent)}
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
