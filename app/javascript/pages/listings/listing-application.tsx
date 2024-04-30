import React, { useContext, useEffect, useState } from "react"

import { LoadingOverlay, NavigationContext, SiteAlert } from "@bloom-housing/ui-components"

import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"

import { ApplicationWrapper } from "../../modules/listingApplications/ApplicationWrapper"

const ListingApplication = () => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { router } = useContext(NavigationContext)
  const [listing, setListing] = useState<RailsListing>(null)

  useEffect(() => {
    const path = getPathWithoutLanguagePrefix(router.pathname)
    void getListing(path.split("/")[2]).then((listing: RailsListing) => {
      if (!listing) {
        router.push("/")
      }
      setListing(listing)
    })
  }, [router, router.pathname])

  return (
    <LoadingOverlay isLoading={!listing}>
      <Layout title={listing?.Name}>
        <div className="flex absolute w-full flex-col items-center border-0 border-t border-solid">
          <SiteAlert type="alert" className={alertClasses} />
          <SiteAlert type="success" className={alertClasses} timeout={30_000} />
        </div>
        {listing && <ApplicationWrapper listing={listing} />}
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingApplication)
