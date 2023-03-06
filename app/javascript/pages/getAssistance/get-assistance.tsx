import { t } from "@bloom-housing/ui-components"
import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const GetAssistance = () => {
  return (
    <Layout title={t("pageTitle.getAssistance")}>{<h1>{t("pageTitle.getAssistance")}</h1>}</Layout>
  )
}

export default withAppSetup(GetAssistance)
