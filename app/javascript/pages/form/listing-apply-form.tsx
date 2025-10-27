import React, { useMemo, useEffect, useState } from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import type { RailsListing } from "../../modules/listings/SharedHelpers"
import { AppPages, getListingDetailPath } from "../../util/routeUtil"
import { LoadingOverlay } from "@bloom-housing/ui-components"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import FormEngine from "../../formEngine/formEngine"
import listingApplicationDefaultRental from "../../formEngine/listingApplicationDefaultRental.json"
import "./listing-apply-form.scss"

interface ListingApplyFormProps {
  assetPaths: unknown
  listingId: string
}

const ListingApplyForm = (props: ListingApplyFormProps) => {
  const [listing, setListing] = useState<RailsListing>(null)

  const { flagsReady, unleashFlag: formEngine } = useFeatureFlag(UNLEASH_FLAG.FORM_ENGINE, false)

  useMemo(() => {
    if (flagsReady && !formEngine)
      window.location.assign(`${getListingDetailPath()}/${props.listingId}`)
  }, [flagsReady, formEngine, props.listingId])

  useEffect(() => {
    void getListing(props.listingId).then((listing: RailsListing) => {
      setListing(listing)
    })
  }, [props.listingId])

  return (
    <LoadingOverlay isLoading={!listing && !formEngine}>
      <Layout title={listing?.Name ? `${listing?.Name} Application` : null}>
        {listing && <FormEngine listing={listing} schema={listingApplicationDefaultRental} />}
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingApplyForm, { pageName: AppPages.ListingApplyForm })
