import React from "react"

import { t } from "@bloom-housing/ui-components"
import { getSaleListings } from "../api/listingsApiService"
import { DirectoryPage } from "./ListingDirectory/DirectoryPage"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import BuyHeader from "./ListingDirectory/BuyHeader"

const RentDirectory = () => {
  return (
    <Layout title={t("pageTitle.saleListings")}>
      <BuyHeader />
      <DirectoryPage listingsAPI={getSaleListings} directoryType={"forSale"} />
    </Layout>
  )
}

export default withAppSetup(RentDirectory)
