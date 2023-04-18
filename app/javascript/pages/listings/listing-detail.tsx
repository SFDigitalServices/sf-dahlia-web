import React, { useContext, useEffect, useState } from "react"
import {
  ListingDetails,
  LoadingOverlay,
  Mobile,
  NavigationContext,
  SiteAlert,
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
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { ListingDetailsReservedBanner } from "../../modules/listingDetails/ListingDetailsReservedBanner"
import { ListingDetailsApplicationDate } from "../../modules/listingDetailsAside/ListingDetailsApplicationDate"
import {
  getAmiChartDataFromUnits,
  isOpen,
  isPluralSRO,
  listingHasSROUnits,
} from "../../util/listingUtil"
import { MobileListingDetailsLottery } from "../../modules/listingDetailsLottery/MobileListingDetailsLottery"
import { MailingListSignup } from "../../components/MailingListSignup"
import { ListingDetailsWaitlist } from "../../modules/listingDetailsAside/ListingDetailsWaitlist"
import { MobileListingDetailsProcess } from "../../modules/listingDetailsAside/MobileListingDetailsProcess"
import { ListingDetailsSROInfo } from "../../modules/listingDetails/ListingDetailsSROInfo"
import useTranslate from "../../hooks/useTranslate"
import { ListingDetailsHabitat } from "../../modules/listingDetails/ListingDetailsHabitat"
import { ListingDetailsMOHCD } from "../../modules/listingDetails/ListingDetailsMOHCD"
import { ListingDetailsApply } from "../../modules/listingDetailsAside/ListingDetailsApply"
import ListingDetailsContext from "../../contexts/listingDetails/listingDetailsContext"

const ListingDetail = () => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { router } = useContext(NavigationContext)
  const { getAssetPath } = useContext(ConfigContext)
  const [listing, setListing] = useState<RailsListing>(null)
  const isApplicationOpen = listing && isOpen(listing)
  useTranslate()

  const {
    fetchUnits,
    fetchedUnits,
    fetchingUnits,
    fetchAmiCharts,
    fetchedAmiCharts,
    fetchingAmiCharts,
  } = useContext(ListingDetailsContext)

  useEffect(() => {
    if (listing?.listingID && !fetchedUnits && !fetchingUnits) {
      fetchUnits(listing.listingID)
    }
  }, [listing?.listingID, fetchUnits, fetchingUnits, fetchedUnits])

  useEffect(() => {
    if (listing?.listingID && getAmiChartDataFromUnits && !fetchingAmiCharts && !fetchedAmiCharts) {
      const chartsToFetch = getAmiChartDataFromUnits(listing.Units)
      fetchAmiCharts(chartsToFetch)
    }
  }, [
    listing?.listingID,
    getAmiChartDataFromUnits,
    fetchAmiCharts,
    fetchedAmiCharts,
    fetchingAmiCharts,
  ])

  useEffect(() => {
    const path = getPathWithoutLanguagePrefix(router.pathname)
    void getListing(path.split("/")[2]).then((listing: RailsListing) => {
      setListing(listing)
    })
  }, [router.pathname])

  return (
    <LoadingOverlay isLoading={!listing}>
      <Layout title={listing?.Name}>
        <div className="flex absolute w-full flex-col items-center border-0 border-t border-solid">
          <SiteAlert type="alert" className={alertClasses} />
          <SiteAlert type="success" className={alertClasses} timeout={30_000} />
        </div>
        {listing && (
          <article className="flex flex-wrap relative max-w-5xl m-auto w-full">
            <ListingDetailsImageCard listing={listing} />
            <ListingDetailsHabitat listing={listing} />
            {!isApplicationOpen && (
              <Mobile>
                <ListingDetailsApplicationDate
                  isApplicationOpen={isApplicationOpen}
                  listing={listing}
                />
              </Mobile>
            )}
            <ListingDetailsReservedBanner
              reservedCommunityMinimumAge={listing.Reserved_community_minimum_age}
              reservedCommunityType={listing.Reserved_community_type}
            />
            <ListingDetailsPricingTable listing={listing} />
            {listingHasSROUnits(listing) &&
              !(
                isPluralSRO("1335 Folsom Street", listing) || isPluralSRO("750 Harrison", listing)
              ) && (
                <div className="md:w-2/3 md:pr-8">
                  <ListingDetailsSROInfo listing={listing} />
                </div>
              )}
            {isApplicationOpen && (
              <Mobile>
                <ListingDetailsApplicationDate
                  isApplicationOpen={isApplicationOpen}
                  listing={listing}
                />
                <ListingDetailsWaitlist listing={listing} />
              </Mobile>
            )}
            <Mobile>
              <ListingDetailsApply listing={listing} />
            </Mobile>
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
              <MobileListingDetailsProcess
                listing={listing}
                imageSrc={getAssetPath("listing-units.svg")}
                isApplicationOpen={isApplicationOpen}
              />
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
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingDetail)
