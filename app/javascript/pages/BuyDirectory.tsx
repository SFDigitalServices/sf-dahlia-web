import React, { Dispatch, SetStateAction } from "react"

import { ActionBlock, ActionBlockLayout, t } from "@bloom-housing/ui-components"

import { getSaleListings } from "../api/listingsApiService"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import RailsSaleListing from "../api/types/rails/listings/RailsSaleListing"
import Link from "../navigation/Link"
import { EligibilityFilters } from "../api/listingsApiService"

import { GenericDirectory } from "./ListingDirectory/GenericDirectory"
import {
  getRangeString,
  showWaitlist,
  getAvailabilityString,
  matchedTextBanner,
  noMatchesTextBanner,
  eligibilityHeader,
  getMinMax,
} from "./ListingDirectory/DirectoryHelpers"
import BuyHeader from "./ListingDirectory/BuyHeader"

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

const getBuyHeader = (
  filters: EligibilityFilters,
  setFilters: Dispatch<SetStateAction<EligibilityFilters>>,
  match: boolean
) => {
  return filters ? (
    <>
      {eligibilityHeader(filters, setFilters, "Showing matching units for sale")}
      <hr />

      {match
        ? matchedTextBanner()
        : noMatchesTextBanner(
            `Based on information you entered, you don't match any current listings for rent.`
          )}
    </>
  ) : (
    <BuyHeader />
  )
}

const getFindMoreActionBlock = (filters: EligibilityFilters, match: boolean) => {
  return (
    <>
      {(!filters || match) && (
        <div className="bg-primary-darker">
          <div className="max-w-5xl mx-auto p-2 md:p-4">
            <ActionBlock
              header={t("saleDirectory.callout.title")}
              background="primary-darker"
              layout={ActionBlockLayout.inline}
              actions={[
                <Link
                  className="button"
                  key="action-1"
                  external
                  href={"https://sfmohcd.org/current-bmr-homeownership-listings"}
                >
                  {t("saleDirectory.callout.firstComeFirstServed")}
                </Link>,
                <Link
                  className="button"
                  key="action-2"
                  external
                  href={"https://sfmohcd.org/current-listings-city-second-program"}
                >
                  {t("saleDirectory.callout.citySecondLoan")}
                </Link>,
              ]}
            />
          </div>
        </div>
      )}
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

export default withAppSetup(RentDirectory)
