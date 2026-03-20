import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import listingApplyStepWrapperStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyHouseholdIncomeHeader = () => {
  const titleString = t("d2Income.title")

  return (
    <CardHeader divider="inset">
      <h1 className={listingApplyStepWrapperStyles["step-title"]}>{titleString}</h1>
      <p className="field-note text-base">Household Income Description</p>
    </CardHeader>
  )
}

export default ListingApplyHouseholdIncomeHeader
