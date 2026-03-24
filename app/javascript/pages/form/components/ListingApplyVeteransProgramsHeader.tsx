import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import listingApplyStepWrapperStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyVeteransProgramsHeader = () => {
  const titleString = t("e7a_veterans_preference.title")

  return (
    <CardHeader divider="inset">
      <h1 className={listingApplyStepWrapperStyles["step-title"]}>{titleString}</h1>
      <p className="field-note text-base">Veterans Program Description</p>
    </CardHeader>
  )
}

export default ListingApplyVeteransProgramsHeader
