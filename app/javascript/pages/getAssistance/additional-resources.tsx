import { t } from "@bloom-housing/ui-components"
import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const AdditionalResources = () => {
  return (
    <Layout title={t("pageTitle.additionalResources")}>
      {<h1>{t("pageTitle.additionalResources")}</h1>}
    </Layout>
  )
}

export default withAppSetup(AdditionalResources)
