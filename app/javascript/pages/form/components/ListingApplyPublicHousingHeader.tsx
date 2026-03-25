import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import listingApplyStepWrapperStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyPublicHousingHeader = () => {
  const formEngineContext = useFormEngineContext()
  const { formData } = formEngineContext

  const titleString =
    formData.liveAlone === "false"
      ? t("c4HouseholdPublicHousing.titleHousehold")
      : t("c4HouseholdPublicHousing.titleYou")

  return (
    <CardHeader divider="inset">
      <h1 className={listingApplyStepWrapperStyles["step-title"]}>{titleString}</h1>
      <p className="field-note text-base">{t("c4HouseholdPublicHousing.p1")}</p>
    </CardHeader>
  )
}

export default ListingApplyPublicHousingHeader
