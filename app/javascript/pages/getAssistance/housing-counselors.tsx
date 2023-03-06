import { t } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"
// Counselors can help you with your DAHLIA application and housing search.
const HousingCounselors = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.housingCouneslorss")}
      subtitle={t("pageSubtitle.housingCounselors")}
    >
      <h1>{t("assistance.title.housingCouneslors")}</h1>
    </AssistanceLayout>
  )
}

export default withAppSetup(HousingCounselors)
