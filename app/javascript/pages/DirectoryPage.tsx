import React, { useEffect } from "react"

import { t } from "@bloom-housing/ui-components"
import Head from "next/head"

import { getRentalListings } from "../api/listingsApiService"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"

interface DirectoryProps {
  isRental: boolean
  assetPaths: unknown
}

const DirectoryPage = (props: DirectoryProps) => {
  useEffect(() => {
    // todo: remove this. it's just for display purposes
    void getRentalListings().then((listings) => console.log(listings))
  }, [])

  return (
    <Layout>
      <Head>
        <title>{t("t.dahliaSanFranciscoHousingPortal")}</title>
      </Head>
      Is Rental: {String(props.isRental)}
    </Layout>
  )
}

export default withAppSetup(DirectoryPage)
