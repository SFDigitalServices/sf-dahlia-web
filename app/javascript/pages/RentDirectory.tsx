import React, { Dispatch, SetStateAction } from "react"

import Markdown from "markdown-to-jsx"
import {
  ActionBlock,
  ActionBlockLayout,
  t,
  LinkButton,
  PageHeader,
} from "@bloom-housing/ui-components"

import { getRentalListings, EligibilityFilters } from "../api/listingsApiService"
import { GenericDirectory } from "./ListingDirectory/GenericDirectory"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import Link from "../navigation/Link"
import {
  getAdditionalResourcesPath,
  getEligibilityEstimatorLink,
  getHelpCalculatingIncomeLink,
} from "../util/routeUtil"
import { emptyIfNotTranslated } from "../util/languageUtil"

import {
  getRangeString,
  getRentRangeString,
  getRentSubText,
  showWaitlist,
  getAvailabilityString,
  matchedTextBanner,
  noMatchesTextBanner,
  eligibilityHeader,
} from "./ListingDirectory/DirectoryHelpers"

const getForRentSummaryTable = (listing: RailsRentalListing) =>
  listing.unitSummaries.general
    .filter((summary) => !!summary.unitType)
    .map((summary) => ({
      unitType: {
        cellText:
          emptyIfNotTranslated(`listings.unitTypes.${summary.unitType}`) || summary.unitType,
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

const getRentalHeader = (
  filters: EligibilityFilters,
  setFilters: Dispatch<SetStateAction<EligibilityFilters>>,
  match: boolean
) => {
  return filters ? (
    <>
      {eligibilityHeader(
        filters,
        setFilters,
        `${t("listings.eligibilityCalculator.rent.showingMatchingUnits")}`
      )}
      <hr />

      {match
        ? matchedTextBanner()
        : noMatchesTextBanner(`${t("listings.eligibilityCalculator.rent.noMatchingUnits")}`)}
    </>
  ) : (
    <PageHeader title={t("rentalDirectory.title")} subtitle={t("rentalDirectory.ifYouTellUs")}>
      <p className="mt-4 md:mt-8 mb-2">
        <LinkButton href={getEligibilityEstimatorLink()}>
          {t("rentalDirectory.findMatchingListings")}
        </LinkButton>
      </p>
      <Markdown className="text-base">
        {t("rentalDirectory.orGetHelpCalculating", { incomeLink: getHelpCalculatingIncomeLink() })}
      </Markdown>
    </PageHeader>
  )
}

const getFindMoreActionBlock = () => {
  return (
    <>
      <div className="bg-primary-darker">
        <div className="max-w-5xl mx-auto p-2 md:p-4">
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
        </div>
      </div>
    </>
  )
}

const RentDirectory = () => {
  const eligibilityFilters: EligibilityFilters = JSON.parse(
    localStorage.getItem("ngStorage-eligibility_filters")
  )

  const hasSetEligibilityFilters = () => {
    return (
      eligibilityFilters?.children_under_6 ||
      eligibilityFilters?.household_size ||
      eligibilityFilters?.include_children_under_6 !== false ||
      eligibilityFilters?.income_timeframe ||
      eligibilityFilters?.income_total
    )
  }

  return (
    <Layout title={t("pageTitle.rentalListings")}>
      <GenericDirectory
        listingsAPI={getRentalListings}
        directoryType={"forRent"}
        filters={hasSetEligibilityFilters() ? eligibilityFilters : null}
        getSummaryTable={getForRentSummaryTable}
        getPageHeader={getRentalHeader}
        findMoreActionBlock={getFindMoreActionBlock}
      />
    </Layout>
  )
}

export default withAppSetup(RentDirectory)
