import React, { useContext, useEffect, useState } from "react"

import {
  ListingDetails,
  LoadingOverlay,
  Mobile,
  NavigationContext,
  SiteAlert,
  t,
} from "@bloom-housing/ui-components"

import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import { ListingDetailsImageCard } from "../../modules/listingDetails/ListingDetailsImageCard"
import { ListingDetailsPricingTable } from "../../modules/listingDetails/ListingDetailsPricingTable"
import { ListingDetailsAside } from "../../modules/listingDetailsAside/ListingDetailsAside"
import { ListingDetailsEligibility } from "../../modules/listingDetails/ListingDetailsEligibility"
import { ListingDetailsFeatures } from "../../modules/listingDetails/ListingDetailsFeatures"
import { ListingDetailsNeighborhood } from "../../modules/listingDetails/ListingDetailsNeighborhood"
import { ListingDetailsAdditionalInformation } from "../../modules/listingDetails/ListingDetailsAdditionalInformation"
import { ConfigContext } from "../../lib/ConfigContext"
import { getPathWithoutLanguagePrefix, localizedFormat } from "../../util/languageUtil"
import { ListingDetailsReservedBanner } from "../../modules/listingDetails/ListingDetailsReservedBanner"
import { ListingDetailsApplicationDate } from "../../modules/listingDetailsAside/ListingDetailsApplicationDate"
import {
  isHabitatListing,
  getAmiChartDataFromUnits,
  isOpen,
  isRental,
  listingHasSROUnits,
  getListingAddressString,
  isFcfsSalesListing,
  getFcfsSalesListingState,
} from "../../util/listingUtil"
import { MobileListingDetailsLottery } from "../../modules/listingDetailsLottery/MobileListingDetailsLottery"
import { MailingListSignup } from "../../components/MailingListSignup"
import { ListingDetailsWaitlist } from "../../modules/listingDetailsAside/ListingDetailsWaitlist"
import { ListingDetailsSROInfo } from "../../modules/listingDetails/ListingDetailsSROInfo"
import { ListingDetailsHabitat } from "../../modules/listingDetails/ListingDetailsHabitat"
import { ListingDetailsMOHCD } from "../../modules/listingDetails/ListingDetailsMOHCD"
import { ListingDetailsApply } from "../../modules/listingDetailsAside/ListingDetailsApply"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"
import ErrorBoundary, { BoundaryScope } from "../../components/ErrorBoundary"
import dayjs from "dayjs"
import useTranslate from "../../hooks/useTranslate"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { MobileListingDetailsSeeTheUnit } from "../../modules/listingDetailsAside/MobileListingDetailsSeeTheUnit"
import { MobileListingDetailsProcess } from "../../modules/listingDetailsAside/MobileListingDetailsProcess"
import { fcfsNoLotteryRequired } from "../../modules/noLotteryRequired/fcfsNoLotteryRequired"
import { NeedHelpBlock } from "../../modules/listingDetailsAside/ListingDetailsNeedHelp"
import { ListingState } from "../../modules/listings/ListingState"
import { useGTMDataLayer } from "../../hooks/analytics/useGTMDataLayer"
import { AppPages } from "../../util/routeUtil"

const ListingDetail = () => {
  const { flagsReady, unleashFlag: isCloudTranslationEnabled } = useFeatureFlag(
    "GoogleCloudTranslate",
    true
  )
  useTranslate(flagsReady ? isCloudTranslationEnabled : undefined)

  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { router } = useContext(NavigationContext)
  const { getAssetPath } = useContext(ConfigContext)
  const [listing, setListing] = useState<RailsListing>(null)
  const isApplicationOpen =
    listing &&
    (isFcfsSalesListing(listing)
      ? getFcfsSalesListingState(listing) !== ListingState.Closed
      : isOpen(listing))
  const listingIsHabitat = listing && isHabitatListing(listing)

  const {
    units,
    fetchUnits,
    fetchedUnits,
    fetchingUnits,
    fetchAmiCharts,
    fetchedAmiCharts,
    fetchingAmiCharts,
  } = useContext(ListingDetailsContext)

  const { pushToDataLayer } = useGTMDataLayer()

  useEffect(() => {
    if (listing) {
      const tagManagerArgs = {
        listing_tenure: listing.Tenure,
        listing_status: listing?.Status,
        listing_name: listing.Name,
        listing_record_type: listing?.RecordType?.Name,
        listing_num_preferences: listing?.Listing_Lottery_Preferences?.length,
        listing_custom_type: listing?.Custom_Listing_Type,
        listingType: listing?.Listing_Type,
        listing_id: listing.Id,
      }
      pushToDataLayer("view_listing", tagManagerArgs)
    }
  }, [listing, pushToDataLayer, units])

  useEffect(() => {
    if (listing?.listingID && !fetchedUnits && !fetchingUnits) {
      fetchUnits(listing.listingID)
    }
  }, [listing?.listingID, fetchUnits, fetchingUnits, fetchedUnits])

  useEffect(() => {
    if (listing?.listingID && !fetchingAmiCharts && !fetchedAmiCharts && fetchedUnits) {
      const chartsToFetch = getAmiChartDataFromUnits(units)
      fetchAmiCharts(chartsToFetch)
    }
  }, [listing?.listingID, fetchAmiCharts, fetchedAmiCharts, fetchingAmiCharts, fetchedUnits, units])

  useEffect(() => {
    const path = getPathWithoutLanguagePrefix(router.pathname)
    void getListing(path.split("/")[2]).then((listing: RailsListing) => {
      if (!listing) {
        router.push("/")
      }
      setListing(listing)
    })
  }, [router, router.pathname])

  const getDescription = (listing: RailsListing) =>
    `${getListingAddressString(listing)}. ${t(
      isApplicationOpen
        ? "listingDetails.applicationDeadline.open"
        : "listingDetails.applicationDeadline.closed",
      {
        date: localizedFormat(listing.Application_Due_Date, "ll"),
        time: dayjs(listing.Application_Due_Date).tz().format("h:mm A"),
      }
    )}`
  return (
    <LoadingOverlay isLoading={!listing}>
      <Layout
        title={listing?.Name ? listing?.Name : null}
        description={listing ? getDescription(listing) : null}
        image={listing?.Listing_Images ? listing?.Listing_Images[0].displayImageURL : null}
      >
        <div className="overflow-x-hidden">
          <div className="flex absolute w-full flex-col items-center border-0 border-t border-solid">
            <SiteAlert type="alert" className={alertClasses} />
            <SiteAlert type="success" className={alertClasses} timeout={30_000} />
          </div>
          {listing && (
            <article className="flex flex-wrap flex-col relative max-w-5xl m-auto w-full">
              <ListingDetailsImageCard listing={listing} />
              {listingIsHabitat && (
                <Mobile>
                  <ListingDetailsApplicationDate listing={listing} />
                </Mobile>
              )}
              <ListingDetailsHabitat listing={listing} />
              {!isApplicationOpen && !listingIsHabitat && (
                <Mobile>
                  <ListingDetailsApplicationDate listing={listing} />
                </Mobile>
              )}
              <ListingDetailsReservedBanner
                reservedCommunityMinimumAge={listing.Reserved_community_minimum_age}
                reservedCommunityType={listing.Reserved_community_type}
                customListingType={listing.Custom_Listing_Type}
              />
              <ErrorBoundary
                boundaryScope={BoundaryScope.component}
                componentClassNames="p-4 text-left"
              >
                <ListingDetailsPricingTable listing={listing} />
              </ErrorBoundary>
              {listingHasSROUnits(listing) && (
                <div className="md:w-2/3 md:pr-8">
                  <ListingDetailsSROInfo listing={listing} />
                </div>
              )}
              {isApplicationOpen && !listingIsHabitat && (
                <Mobile>
                  <ListingDetailsApplicationDate listing={listing} />
                  <ListingDetailsWaitlist listing={listing} />
                </Mobile>
              )}
              {isFcfsSalesListing(listing) && <Mobile>{fcfsNoLotteryRequired()}</Mobile>}
              {listing.Accepting_Online_Applications && (
                <Mobile>
                  <ListingDetailsApply listing={listing} />
                </Mobile>
              )}
              {isApplicationOpen && (
                <Mobile>
                  <div className="border-b border-t m-0">
                    <NeedHelpBlock listing={listing} />
                  </div>
                </Mobile>
              )}
              <ListingDetailsAside listing={listing} imageSrc={getAssetPath("listing-units.svg")} />
              <ListingDetails>
                <MobileListingDetailsLottery
                  imageSrc={getAssetPath("listing-units.svg")}
                  listing={listing}
                />
                <ListingDetailsEligibility
                  listing={listing}
                  imageSrc={getAssetPath("listing-eligibility.svg")}
                />
                {!isRental(listing) ? (
                  <MobileListingDetailsSeeTheUnit
                    listing={listing}
                    imageSrc={getAssetPath("listing-units.svg")}
                  />
                ) : (
                  <MobileListingDetailsProcess
                    listing={listing}
                    imageSrc={getAssetPath("listing-units.svg")}
                    isApplicationOpen={isApplicationOpen}
                  />
                )}
                <></>
                <ListingDetailsFeatures
                  listing={listing}
                  imageSrc={getAssetPath("listing-features.svg")}
                />
                <ListingDetailsNeighborhood
                  imageSrc={getAssetPath("listing-neighborhood.svg")}
                  listing={listing}
                />
                <ListingDetailsAdditionalInformation
                  listing={listing}
                  imageSrc={getAssetPath("listing-legal.svg")}
                />
                <ListingDetailsMOHCD />
              </ListingDetails>
            </article>
          )}
          <MailingListSignup />
        </div>
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingDetail, { pageName: AppPages.ListingDetail })
