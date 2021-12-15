import React from "react"

import { t } from "@bloom-housing/ui-components"
import { getRentalListings } from "../api/listingsApiService"
import { DirectoryPage } from "./ListingDirectory/DirectoryPage"
import RentalHeader from "./ListingDirectory/RentalHeader"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"

const RentDirectory = () => {
  return (
    <Layout title={t("pageTitle.rentalListings")}>
      <RentalHeader />
      <DirectoryPage listingsAPI={getRentalListings} directoryType={"forRent"} />
    </Layout>
  )
}

export default withAppSetup(RentDirectory)
