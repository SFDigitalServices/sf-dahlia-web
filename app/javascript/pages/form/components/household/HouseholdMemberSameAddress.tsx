/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"
import styles from "./HouseholdMemberSameAddress.module.scss"
import YesNoRadio from "../YesNoRadio"
import Address from "../Address"

const fieldNames = {
  addressStreet: "householdMemberAddressStreet",
  addressAptOrUnit: "householdMemberAddressAptOrUnit",
  addressCity: "householdMemberAddressCity",
  addressState: "householdMemberAddressState",
  addressZipcode: "householdMemberAddressZipcode",
}

const HouseholdMemberSameAddress = () => {
  const { watch } = useFormContext()
  const hasSameAddress = watch("hasSameAddressAsApplicant")
  const showAddressField = hasSameAddress === "false"

  return (
    <fieldset>
      <legend className="legend-header">{t("label.memberSameAddress")}</legend>
      <div className={styles["household-member-radio"]}>
        <YesNoRadio fieldNames={{ question: "hasSameAddressAsApplicant" }} />
      </div>
      {showAddressField && (
        <div className={styles["household-member-address-field"]}>
          <Address
            showAptOrUnit={true}
            requireAddress={showAddressField}
            note="c3HouseholdMemberForm.memberAddressDesc"
            fieldNames={fieldNames}
          />
        </div>
      )}
    </fieldset>
  )
}

export default HouseholdMemberSameAddress
