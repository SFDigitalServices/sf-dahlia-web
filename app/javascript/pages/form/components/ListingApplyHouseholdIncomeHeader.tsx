import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import stepStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyHouseholdIncomeHeader = () => {
  const titleString = t("d2Income.title")

  return (
    <CardHeader divider="inset">
      <h1 className={stepStyles["step-title"]}>{titleString}</h1>
      <p className={stepStyles["step-description"]}>{t("d2Income.p1")}</p>
      <p className={stepStyles["step-description"]}>{t("d2Income.p2")}</p>
    </CardHeader>
  )
}

export default ListingApplyHouseholdIncomeHeader
