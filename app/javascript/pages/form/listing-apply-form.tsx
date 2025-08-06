import React, { useMemo, useEffect, useState } from "react"
import Layout from "layouts/Layout"
import withAppSetup from "layouts/withAppSetup"
import { getListing } from "api/listingApiService"
import type { RailsListing } from "modules/listings/SharedHelpers"
import { AppPages, getListingDetailPath } from "util/routeUtil"
import { LoadingOverlay } from "@bloom-housing/ui-components"
import Intro from "./components/intro"
import { useFeatureFlag } from "hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "modules/constants"

interface ListingApplyFormProps {
  assetPaths: unknown
  listingId: string
}

const ListingApplyForm = (props: ListingApplyFormProps) => {
  const [listing, setListing] = useState<RailsListing>(null)

  const { unleashFlag: formEngine } = useFeatureFlag(UNLEASH_FLAG.FORM_ENGINE, false)

  useMemo(() => {
    if (!formEngine) window.location.href = `${getListingDetailPath()}/${props.listingId}`
  }, [formEngine, props.listingId])

  useEffect(() => {
    void getListing(props.listingId).then((listing: RailsListing) => {
      setListing(listing)
    })
  }, [props.listingId])

  return (
    <LoadingOverlay isLoading={!listing && !formEngine}>
      <Layout title={listing?.Name ? `${listing?.Name} Application` : null}>
        <div className="bg-gray-300 flex justify-center p-8">
          {listing && <Intro listing={listing} />}
        </div>
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingApplyForm, { pageName: AppPages.ListingApplyForm })
