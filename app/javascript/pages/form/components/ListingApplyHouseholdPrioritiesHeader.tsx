import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import listingApplyStepWrapperStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyHouseholdPrioritiesHeader = () => {
  const formEngineContext = useFormEngineContext()
  const { formData } = formEngineContext

  const titleString =
    formData.liveAlone === "false"
      ? t("c7HouseholdPriorities.titleHousehold")
      : t("c7HouseholdPriorities.titleYou")

  return (
    <CardHeader divider="inset">
      <h1 className={listingApplyStepWrapperStyles["step-title"]}>{titleString}</h1>
      <p className={listingApplyStepWrapperStyles["step-description"]}>
        {t("c7HouseholdPriorities.p1")}
      </p>
    </CardHeader>
  )
}

export default ListingApplyHouseholdPrioritiesHeader
