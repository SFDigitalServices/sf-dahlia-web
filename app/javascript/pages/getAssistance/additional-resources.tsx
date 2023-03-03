import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { t } from "@bloom-housing/ui-components"
import AssistanceLayout from "../../layouts/AssistanceLayout"

const AdditionalResources = () => {
  return (
    <AssistanceLayout
      title={t("pageTitle.additionalHousingOpportunities")}
      subtitle={t("pageSubtitle.additionalHousingOpportunities")}
    >
      <h1>{t("pageTitle.additionalHousingOpportunities")}</h1>
    </AssistanceLayout>
  )
}

export default withAppSetup(AdditionalResources)
