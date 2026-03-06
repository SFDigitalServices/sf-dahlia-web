import React, { useMemo, useEffect, useState } from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing, getPreferences } from "../../api/listingApiService"
import type { RailsListing } from "../../modules/listings/SharedHelpers"
import type { RailsListingPreference } from "../../api/types/rails/listings/RailsListingPreferences"
import { AppPages, getListingDetailPath } from "../../util/routeUtil"
import { LoadingOverlay } from "@bloom-housing/ui-components"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import FormEngine from "../../formEngine/formEngine"
import listingApplicationDefaultRental from "../../formEngine/listingApplicationDefaultRental.json"
import "./overrides.scss"

interface ListingApplyFormProps {
  assetPaths: unknown
  listingId: string
}

const ListingApplyForm = (props: ListingApplyFormProps) => {
  const [listing, setListing] = useState<RailsListing>(null)
  const [preferences, setPreferences] = useState<RailsListingPreference[]>(null)

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

  useEffect(() => {
    void getPreferences(props.listingId).then((preferences: RailsListingPreference[]) => {
      setPreferences(preferences)
    })
  }, [props.listingId])

  return (
    <LoadingOverlay isLoading={!listing && !preferences && !formEngine}>
      <Layout title={listing?.Name ? `${listing?.Name} Application` : null}>
        {listing && (
          <FormEngine
            listing={listing}
            preferences={preferences}
            schema={listingApplicationDefaultRental}
          />
        )}
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingApplyForm, { pageName: AppPages.ListingApplyForm })
