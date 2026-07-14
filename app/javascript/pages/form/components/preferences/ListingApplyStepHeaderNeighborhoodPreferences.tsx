import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import styles from "./ListingApplyPreferenceStepWrapper.module.scss"
import { renderInlineMarkup } from "../../../../util/languageUtil"
import { liveInTheNeighborhoodHouseholdMembers } from "../household/householdUtils"

const eligibleForAssistedHousingOrRentBurdenValue = () => {
  // TODO: DAH-4176
  // formData.hasPublicHousing === 'yes' || eligibleForRentBurden(...)
  return false
}

const GoodNewsHeader = ({
  addressesString,
  instructionsP2,
}: {
  addressesString: string
  instructionsP2: string
}) => {
  return (
    <CardHeader divider="inset" className={styles["green-background"]}>
      <h1 className={styles["step-title"]}>{t("label.goodNewsForHigherRanking")}</h1>
      <p className={styles["step-description"]}>{renderInlineMarkup(addressesString)}</p>
      <p className={styles["step-description"]}>{renderInlineMarkup(t(instructionsP2))}</p>
    </CardHeader>
  )
}

const Header = ({
  addressesString,
  instructionsP2,
}: {
  addressesString: string
  instructionsP2: string
}) => {
  return (
    <CardHeader divider="inset">
      <h1 className={styles["step-title"]}>{renderInlineMarkup(addressesString)}</h1>
      <p className={styles["step-description"]}>{renderInlineMarkup(t(instructionsP2))}</p>
    </CardHeader>
  )
}

const ListingApplyStepHeaderNeighborhoodPreferences = ({
  instructionsP1Plural,
  instructionsP1Singular,
  instructionsP2,
}: {
  instructionsP1Plural: string
  instructionsP1Singular: string
  instructionsP2: string
}) => {
  const formEngineContext = useFormEngineContext()
  const { formData } = formEngineContext

  const liveInTheNeighborhoodAddresses = [
    ...new Set(
      liveInTheNeighborhoodHouseholdMembers(formData)
        .map((member) => member.householdMemberAddressStreet)
        .filter((addressStreet) => typeof addressStreet === "string" && addressStreet.length > 0)
    ),
  ]

  const addressesString =
    liveInTheNeighborhoodAddresses.length > 1
      ? t(instructionsP1Plural, {
          address: liveInTheNeighborhoodAddresses.join(" and "), // not great for non-english, but the Angular code does this
        })
      : t(instructionsP1Singular, {
          address: liveInTheNeighborhoodAddresses[0] || "", // this component should not render if array is empty
        })

  if (eligibleForAssistedHousingOrRentBurdenValue())
    return <Header addressesString={addressesString} instructionsP2={instructionsP2} />

  return <GoodNewsHeader addressesString={addressesString} instructionsP2={instructionsP2} />
}

export default ListingApplyStepHeaderNeighborhoodPreferences
