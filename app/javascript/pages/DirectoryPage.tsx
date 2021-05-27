import React from "react"

import { t } from "@bloom-housing/ui-components"
import Head from "next/head"

import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"

interface DirectoryProps {
  isRental: boolean
  assetPaths: unknown
}

const DirectoryPage = (props: DirectoryProps) => (
  <Layout>
    <Head>
      <title>{t("t.dahliaSanFranciscoHousingPortal")}</title>
    </Head>
    Is Rental: {String(props.isRental)}
  </Layout>
)

export default withAppSetup(DirectoryPage)
