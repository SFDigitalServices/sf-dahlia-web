import { t } from "@bloom-housing/ui-components"
import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const HousingCounselors = () => {
  return (
    <Layout title={t("pageTitle.housingCounselors")}>
      {<h1>{t("pageTitle.housingCounselors")}</h1>}
    </Layout>
  )
}

export default withAppSetup(HousingCounselors)
