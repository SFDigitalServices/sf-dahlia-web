/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t } from "@bloom-housing/ui-components"
import YesNoRadio from "./YesNoRadio"
import Address from "./Address"
import { useFormContext } from "react-hook-form"
import styles from "./HouseholdMemberSameAddress.module.scss"

interface HouseholdMemberSameAddressProps {
  label: string
  fieldNames: {
    addressStreet: string
    addressAptOrUnit: string
    addressCity: string
    addressState: string
    addressZipcode: string
  }
}

const HouseholdMemberSameAddress = ({ label, fieldNames }: HouseholdMemberSameAddressProps) => {
  const { watch } = useFormContext()
  const hasSameAddress = watch("hasSameAddressAsApplicant")
  const showAddressField = hasSameAddress === "false"

  return (
    <fieldset>
      <legend className="legend-header">{t(label)}</legend>
      <YesNoRadio fieldNames={{ question: "hasSameAddressAsApplicant" }} />
      {showAddressField && (
        <div className={styles["household-member-address-field"]}>
          <Address
            showAptOrUnit={true}
            requireAddress={true}
            note="c3HouseholdMemberForm.memberAddressDesc"
            showMailingAddress={false}
            fieldNames={fieldNames}
          />
        </div>
      )}
    </fieldset>
  )
}

export default HouseholdMemberSameAddress
