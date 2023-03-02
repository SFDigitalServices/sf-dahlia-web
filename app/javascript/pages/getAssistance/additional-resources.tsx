import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { t } from "@bloom-housing/ui-components"
import AssistanceLayout from "../../layouts/AssistanceLayout"

const AdditionalResources = () => {
  return (
    <AssistanceLayout
      title={t("pageTitle.additionalResources")}
      subtitle={
        "Homeless resources in San Francisco. More housing options in the greater Bay Area."
      }
    >
      <h1>{t("pageTitle.additionalResources")}</h1>
    </AssistanceLayout>
  )
}

export default withAppSetup(AdditionalResources)
