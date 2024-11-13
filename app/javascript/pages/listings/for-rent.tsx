import React, { Dispatch, SetStateAction } from "react"

import {
  ActionBlock,
  ActionBlockLayout,
  t,
  LinkButton,
  PageHeader,
  Heading,
} from "@bloom-housing/ui-components"

import { getRentalListings, EligibilityFilters } from "../../api/listingsApiService"
import { GenericDirectory } from "../../modules/listings/GenericDirectory"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import Link from "../../navigation/Link"
import {
  getAdditionalResourcesPath,
  getEligibilityEstimatorLink,
  getHelpCalculatingIncomeLink,
} from "../../util/routeUtil"
import { defaultIfNotTranslated } from "../../util/languageUtil"

import {
  getRangeString,
  getRentRangeString,
  getRentSubText,
  showWaitlist,
  getAvailabilityString,
  matchedTextBanner,
  noMatchesTextBanner,
  eligibilityHeader,
} from "../../modules/listings/DirectoryHelpers"

const getForRentSummaryTable = (listing: RailsRentalListing) => {
  const summary = listing.unitSummaries.general ?? listing.unitSummaries.reserved
  if (!summary) return null

  return summary
    .filter((summary) => !!summary.unitType)
    .map((summary) => ({
      unitType: {
        cellText: defaultIfNotTranslated(
          `listings.unitTypes.${summary.unitType}`,
          summary.unitType
        ),
        cellSubText: getAvailabilityString(listing, summary, false),
        hideMobile: true,
      },
      availability: {
        cellText: getAvailabilityString(listing, summary, true),
        cellSubText: showWaitlist(listing, summary) ? null : t("t.available"),
      },
      colThree: {
        cellText: getRangeString(summary.absoluteMinIncome || 0, summary.absoluteMaxIncome, true),
        cellSubText: t("t.perMonth"),
      },
      colFour: { cellText: getRentRangeString(summary), cellSubText: getRentSubText(summary) },
    }))
}

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
      <a className="text-base text-primary-dark" href={getHelpCalculatingIncomeLink()}>
        {t("rentalDirectory.orGetHelpCalculating")}
      </a>
    </PageHeader>
  )
}

const getFindMoreActionBlock = () => {
  return (
    <>
      <div className="bg-primary-darker">
        <div className="max-w-5xl mx-auto p-2 md:p-4">
          <ActionBlock
            header={<Heading priority={2}>{t("rentalDirectory.callouttitle")}</Heading>}
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
        findMoreActionBlock={getFindMoreActionBlock()}
      />
    </Layout>
  )
}

export default withAppSetup(RentDirectory)
