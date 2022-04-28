import React, { useContext, useEffect, useState } from "react"
import {
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
import { ListingDetailsAside } from "../../modules/listingDetailsAside/ListingDetailsAside"
import { ListingDetailsEligibility } from "../../modules/listingDetails/ListingDetailsEligibility"
import { ListingDetailsFeatures } from "../../modules/listingDetails/ListingDetailsFeatures"
import { ListingDetailsNeighborhood } from "../../modules/listingDetails/ListingDetailsNeighborhood"
import { ListingDetailsAdditionalInformation } from "../../modules/listingDetails/ListingDetailsAdditionalInformation"
import { ConfigContext } from "../../lib/ConfigContext"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"

const ListingDetail = () => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { router } = useContext(NavigationContext)
  const { getAssetPath } = useContext(ConfigContext)
  const [listing, setListing] = useState<RailsListing>(null)

  useEffect(() => {
    const path = getPathWithoutLanguagePrefix(router.pathname)
    void getListing(path.split("/")[2]).then((listing: RailsListing) => {
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
            <ListingDetailsAside listing={listing} imageSrc={getAssetPath("listing-units.svg")} />
            <ListingDetails>
              <ListingDetailsEligibility
                listing={listing}
                imageSrc={getAssetPath("listing-eligibility.svg")}
              />
              <ListingDetailsFeatures
                listing={listing}
                imageSrc={getAssetPath("listing-features.svg")}
              />
              <ListingDetailsNeighborhood imageSrc={getAssetPath("listing-neighborhood.svg")} />
              <ListingDetailsAdditionalInformation
                listing={listing}
                imageSrc={getAssetPath("listing-legal.svg")}
              />
              <div className="listing-detail-panel">
                <div className="info-card flex">
                  {/* TODO: do we have a class for serifs but smaller we can enable? */}
                  <p className="text-serif-lg">{t("listings.monitoredByMohcd")}</p>
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
