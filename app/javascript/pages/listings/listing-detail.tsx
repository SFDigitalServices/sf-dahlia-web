import React, { useContext, useEffect, useState } from "react"
import {
  ListingDetailItem,
  ListingDetails,
  LoadingOverlay,
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
import { ListingDetailsAside } from "../../modules/listingDetails/ListingDetailsAside"
import { ListingDetailsEligibility } from "../../modules/listingDetails/ListingDetailsEligibility"
import { ListingDetailsFeatures } from "../../modules/listingDetails/ListingDetailsFeatures"
import { ListingDetailsNeighborhood } from "../../modules/listingDetails/ListingDetailsNeighborhood"
import { ListingDetailsAdditionalInformation } from "../../modules/listingDetails/ListingDetailsAdditionalInformation"
import { ConfigContext } from "../../lib/ConfigContext"

const ListingDetail = () => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { router } = useContext(NavigationContext)
  const { getAssetPath } = useContext(ConfigContext)
  const [listing, setListing] = useState<RailsListing>(null)

  useEffect(() => {
    void getListing(router.pathname.split("/")[2]).then((listing: RailsListing) => {
      setListing(listing)
    })
  }, [router.pathname])

  return (
    <LoadingOverlay isLoading={!listing}>
      <Layout>
        <div className="flex absolute w-full flex-col items-center border-0 border-t border-solid">
          <SiteAlert type="alert" className={alertClasses} />
          <SiteAlert type="success" className={alertClasses} timeout={30_000} />
        </div>
        {listing && (
          <article className="flex flex-wrap relative max-w-5xl m-auto w-full">
            <ListingDetailsImageCard listing={listing} />
            <ListingDetailsPricingTable listing={listing} />
            <ListingDetails>
              <ListingDetailsEligibility listing={listing} />
              <ListingDetailsFeatures listing={listing} />
              <ListingDetailsNeighborhood />
              <ListingDetailsAdditionalInformation listing={listing} />
              <ListingDetailItem
                imageAlt={""}
                imageSrc={""}
                title={"Process"}
                subtitle={"Process subtitle"}
                hideHeader={true}
                desktopClass="header-hidden"
              >
                <ListingDetailsAside listing={listing} />
              </ListingDetailItem>
              <div className="listing-detail-panel">
                <div className="info-card flex">
                  {/* TODO: do we have a class for serifs but smaller we can enable? */}
                  <p className="text-serif-lg">{t("listings.monitored_by_mohcd")}</p>
                  <img
                    alt={t("listings.equal_housing_opportunity_logo")}
                    src={getAssetPath("logo-equal.png")}
                  />
                </div>
              </div>
            </ListingDetails>
          </article>
        )}
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingDetail)
