import React from "react"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Link } from "@bloom-housing/ui-seeds"
import listingApplyStepWrapperStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyVeteransPreferenceHeader = () => {
  const titleString = t("e7aVeteransPreference.title")

  return (
    <CardHeader divider="inset">
      <h1 className={listingApplyStepWrapperStyles["step-title"]}>{titleString}</h1>
      <p className={listingApplyStepWrapperStyles["step-description"]}>
        {t("e7aVeteransPreference.instructionsP1")}
      </p>
      <p className={listingApplyStepWrapperStyles["step-description"]}>
        <FontAwesomeIcon icon={faCheck} /> {t("e7aVeteransPreference.instructionsP2")}
        <br />
        <FontAwesomeIcon icon={faCheck} /> {t("e7aVeteransPreference.instructionsP3")}
      </p>
      <p className={listingApplyStepWrapperStyles["step-description"]}>
        <strong>{t("e7aVeteransPreference.instructionsP4")}</strong>
      </p>
      <p className={listingApplyStepWrapperStyles["step-description"]}>
        <Link
          newWindowTarget
          hideExternalLinkIcon
          href="https://www.sf.gov/get-priority-housing-lottery-if-you-are-veteran"
        >
          {t("e7aVeteransPreference.instructionsP5")}
        </Link>
      </p>
    </CardHeader>
  )
}

export default ListingApplyVeteransPreferenceHeader
