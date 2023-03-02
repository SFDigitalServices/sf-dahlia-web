import { t } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"

const GetAssistance = () => {
  return (
    <AssistanceLayout
      title={t("pageTitle.getAssistance")}
      subtitle={
        "Get help with your application, find other services, and learn how the lottery works."
      }
    >
      <h1>{t("pageTitle.getAssistance")}</h1>
    </AssistanceLayout>
  )
}

export default withAppSetup(GetAssistance)
