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
import { getListing, getCms, getListingContent } from "../../api/listingApiService"
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
  isHabitatListing,
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
import ErrorBoundary, { BoundaryScope } from "../../components/ErrorBoundary"
import { Cms, CmsItem, CmsContent } from "../../api/types/rails/listings/BaseRailsListing"

const ListingDetail = () => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { router } = useContext(NavigationContext)
  const { getAssetPath } = useContext(ConfigContext)
  const [listing, setListing] = useState<RailsListing>(null)
  const [listingContent, setListingContent] = useState<CmsItem[]>([])
  const [matchingListing, setMatchingListing] = useState<string>(null)
  const isApplicationOpen = listing && isOpen(listing)
  const listingIsHabitat = listing && isHabitatListing(listing)
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
    if (listing?.listingID && !fetchingAmiCharts && !fetchedAmiCharts) {
      const chartsToFetch = getAmiChartDataFromUnits(listing.Units)
      fetchAmiCharts(chartsToFetch)
    }
  }, [listing?.listingID, fetchAmiCharts, fetchedAmiCharts, fetchingAmiCharts, listing?.Units])

  useEffect(() => {
    const path = getPathWithoutLanguagePrefix(router.pathname)
    void getListing(path.split("/")[2]).then((listing: RailsListing) => {
      console.log(listing)
      setListing(listing)
    })
    void getCms().then((cmsResponse: Cms) => {
      const listingContentResponse = cmsResponse.items.filter(item => item.meta.type === "housing.CommonListing")
      setListingContent(listingContentResponse)
    })
  }, [router.pathname])

  useEffect(() => {
    if(!listing || !listingContent) {
      return
    }
    void getListingContent().then((cmsContent: CmsContent) => {
      console.log(listing.Id, cmsContent.listing_id)
      if(listing.Id === cmsContent.listing_id) {
        setMatchingListing(cmsContent.listing_type.listing_image_banner)
      }
    })
  }, [listing, listingContent])

  return (
    <LoadingOverlay isLoading={!listing}>
      <Layout title={listing?.Name}>
        <div className="flex absolute w-full flex-col items-center border-0 border-t border-solid">
          <SiteAlert type="alert" className={alertClasses} />
          <SiteAlert type="success" className={alertClasses} timeout={30_000} />
        </div>
        {listing && (
          <article className="flex flex-wrap flex-col relative max-w-5xl m-auto w-full">
            <ListingDetailsImageCard listing={listing} listingContent={listingContent} matchingListing={matchingListing} />
            {listingIsHabitat && (
              <Mobile>
                <ListingDetailsApplicationDate
                  isApplicationOpen={isApplicationOpen}
                  listing={listing}
                />
              </Mobile>
            )}
            <ListingDetailsHabitat listing={listing} />
            {!isApplicationOpen && !listingIsHabitat && (
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
            <ErrorBoundary
              boundaryScope={BoundaryScope.component}
              componentClassNames="p-4 text-left"
            >
              <ListingDetailsPricingTable listing={listing} />
            </ErrorBoundary>
            {listingHasSROUnits(listing) &&
              !(
                isPluralSRO("1335 Folsom Street", listing) || isPluralSRO("750 Harrison", listing)
              ) && (
                <div className="md:w-2/3 md:pr-8">
                  <ListingDetailsSROInfo listing={listing} />
                </div>
              )}
            {isApplicationOpen && !listingIsHabitat && (
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
