import React, { useState } from "react"

import { t } from "@bloom-housing/ui-components"
import { getRentalListings } from "../api/listingsApiService"
import { DirectoryPage } from "./ListingDirectory/DirectoryPage"
import RentalHeader from "./ListingDirectory/RentalHeader"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import { EligibilityFilters } from "../api/listingsApiService"

const RentDirectory = () => {
  const eligibilityFilters: EligibilityFilters = JSON.parse(
    localStorage.getItem("ngStorage-eligibility_filters")
  )

  const hasSetEligibilityFilters = () => {
    return (
      eligibilityFilters?.children_under_6 ||
      eligibilityFilters?.household_size ||
      eligibilityFilters?.include_children_under_6 !== false ||
      eligibilityFilters?.income_timeframe ||
      eligibilityFilters?.income_total
    )
  }

  return (
    <Layout title={t("pageTitle.rentalListings")}>
      <DirectoryPage
        listingsAPI={getRentalListings}
        directoryType={"forRent"}
        filters={hasSetEligibilityFilters() ? eligibilityFilters : null}
      />
    </Layout>
  )
}

export default withAppSetup(RentDirectory)
