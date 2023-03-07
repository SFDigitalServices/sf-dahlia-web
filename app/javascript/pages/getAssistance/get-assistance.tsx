import { t } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"

const GetAssistance = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.getAssistance")}
      subtitle={t("assistance.subtitle.getAssistance")}
    >
      <h1>{t("assistance.title.getAssistance")}</h1>
    </AssistanceLayout>
  )
}

export default withAppSetup(GetAssistance)
