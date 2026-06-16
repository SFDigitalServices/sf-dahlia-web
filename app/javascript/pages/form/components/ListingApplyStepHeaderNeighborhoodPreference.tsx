import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./preferences/ListingApplyPreferenceStepWrapper.module.scss"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { liveInTheNeighborhoodHouseholdMembers } from "./household/householdUtils"

const GoodNewsHeader = ({ addressesString }: { addressesString: string }) => {
  return (
    <CardHeader divider="inset" className={styles["green-background"]}>
      <h1 className={styles["step-title"]}>{t("label.goodNewsForHigherRanking")}</h1>
      <p className={styles["step-description"]}>{renderInlineMarkup(addressesString)}</p>
      <p className={styles["step-description"]}>
        {renderInlineMarkup(t("e2aNeighborhoodPreference.instructionsP2"))}
      </p>
    </CardHeader>
  )
}

const Header = ({ addressesString }: { addressesString: string }) => {
  return (
    <CardHeader divider="inset">
      <h1 className={styles["step-title"]}>{addressesString}</h1>
      <p className={styles["step-description"]}>
        {renderInlineMarkup(t("e2aNeighborhoodPreference.instructionsP2"))}
      </p>
    </CardHeader>
  )
}

const ListingApplyStepHeaderNeighborhoodPreference = () => {
  const formEngineContext = useFormEngineContext()
  const { formData } = formEngineContext

  // TODO: DAH-4176
  // const eligibleForAssistedHousingOrRentBurden =
  //  formData.hasPublicHousing === 'yes' || eligibleForRentBurden(formData.householdIncome, formData.householdIncome)
  const eligibleForAssistedHousingOrRentBurden = false

  const liveInTheNeighborhoodAddresses = [
    ...new Set(
      liveInTheNeighborhoodHouseholdMembers(formData)
        .map((member) => member.householdMemberAddressStreet)
        .filter((addressStreet) => typeof addressStreet === "string" && addressStreet.length > 1)
    ),
  ]

  const addressesString =
    liveInTheNeighborhoodAddresses.length > 1
      ? t("e2aNeighborhoodPreference.instructionsP1Plural", {
          address: liveInTheNeighborhoodAddresses.join(" and "), // not great for non-english, but the Angular code does this
        })
      : t("e2aNeighborhoodPreference.instructionsP1Singular", {
          address: liveInTheNeighborhoodAddresses[0],
        })

  if (eligibleForAssistedHousingOrRentBurden) return <Header addressesString={addressesString} />
  return <GoodNewsHeader addressesString={addressesString} />
}

export default ListingApplyStepHeaderNeighborhoodPreference
