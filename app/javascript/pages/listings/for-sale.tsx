import React, { Dispatch, SetStateAction } from "react"

import { ActionBlock, ActionBlockLayout, Heading, t } from "@bloom-housing/ui-components"

import { getSaleListings, EligibilityFilters } from "../../api/listingsApiService"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import type RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import Link from "../../navigation/Link"

import { GenericDirectory } from "../../modules/listings/GenericDirectory"
import {
  getRangeString,
  showWaitlist,
  getAvailabilityString,
  matchedTextBanner,
  noMatchesTextBanner,
  eligibilityHeader,
  getMinMax,
} from "../../modules/listings/DirectoryHelpers"
import BuyHeader from "../../modules/listings/BuyHeader"
import { defaultIfNotTranslated } from "../../util/languageUtil"
import "./for-sale.scss"

const getForSaleSummaryTable = (listing: RailsSaleListing) => {
  const summary = listing.unitSummaries.general ?? listing.unitSummaries.reserved
  if (!summary) return null

  return listing.unitSummaries.general
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
        cellText: getRangeString(
          Math.round(
            getMinMax(summary.minHoaDuesWithoutParking, summary.minHoaDuesWithParking, "min")
          ),
          Math.round(
            getMinMax(summary.maxHoaDuesWithoutParking, summary.maxHoaDuesWithParking, "max")
          ),
          true
        ),
        cellSubText: t("t.perMonth"),
      },
      colFour: {
        cellText: getRangeString(
          Math.round(getMinMax(summary.minPriceWithoutParking, summary.minPriceWithParking, "min")),
          Math.round(getMinMax(summary.maxPriceWithoutParking, summary.maxPriceWithParking, "max")),
          true
        ),
      },
    }))
}

const getBuyHeader = (
  filters: EligibilityFilters,
  setFilters: Dispatch<SetStateAction<EligibilityFilters>>,
  match: boolean
) => {
  return filters ? (
    <>
      {eligibilityHeader(
        filters,
        setFilters,
        `${t("listings.eligibilityCalculator.sale.showingMatchingUnits")}`
      )}
      <hr />

      {match
        ? matchedTextBanner()
        : noMatchesTextBanner(`${t("listings.eligibilityCalculator.sale.noMatchingUnits")}`)}
    </>
  ) : (
    <BuyHeader />
  )
}

const getFindMoreActionBlock = () => {
  return (
    <>
      <div className="bg-primary-darker">
        <div className="max-w-5xl mx-auto p-2 md:p-4">
          <ActionBlock
            header={<Heading priority={2}>{t("saleDirectory.callout.title")}</Heading>}
            background="primary-darker"
            layout={ActionBlockLayout.inline}
            actions={[
              <Link
                className="button ml-8"
                external
                href={"https://sfmohcd.org/current-listings-city-second-program"}
              >
                {t("saleDirectory.callout.citySecondLoan")}
              </Link>,
            ]}
          />
        </div>
      </div>
    </>
  )
}
const SaleDirectory = () => {
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
    <Layout title={t("pageTitle.saleListings")}>
      <GenericDirectory
        listingsAPI={getSaleListings}
        directoryType={"forSale"}
        filters={hasSetEligibilityFilters() ? eligibilityFilters : null}
        getSummaryTable={getForSaleSummaryTable}
        getPageHeader={getBuyHeader}
        findMoreActionBlock={getFindMoreActionBlock}
      />
    </Layout>
  )
}

export default withAppSetup(SaleDirectory)
