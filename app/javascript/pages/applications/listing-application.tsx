import React, { useEffect, useState } from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import { AppPages } from "../../util/routeUtil"
import Wizard from "./wizard"

const ListingApplication = (props) => {
  const [listing, setListing] = useState<RailsListing>(null)

  useEffect(() => {
    void getListing(props.listingId).then((listing: RailsListing) => {
      setListing(listing)
    })
  }, [props.listingId])

  return (
    <Layout
      title={listing?.Name ? listing?.Name : null}
      image={listing?.Listing_Images ? listing?.Listing_Images[0].displayImageURL : null}
    >
      <h1>{listing?.Id}</h1>
      <Wizard />
    </Layout>
  )
}

export default withAppSetup(ListingApplication, { pageName: AppPages.ListingApplication })
