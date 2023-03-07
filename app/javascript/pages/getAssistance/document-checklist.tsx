import { t } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"

const DocumentChecklist = () => {
  return (
    <AssistanceLayout
      title={t("assistance.title.documentChecklist")}
      subtitle={t("assistance.subtitle.documentChecklist")}
    >
      {
        <div className="flex flex-col justify-around h-screen">
          <h1>{t("assistance.title.documentChecklist")}</h1>

          <h2 id="anchorMe">I'm an anchor</h2>
        </div>
      }
    </AssistanceLayout>
  )
}

export default withAppSetup(DocumentChecklist)
