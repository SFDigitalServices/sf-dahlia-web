import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { getFormattedAddress } from "../../../util/formEngineUtil"
import styles from "./VerifyAddress.module.scss"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import type { Address } from "../../../api/formApiService"

interface VerifyAddressProps {
  addressData?: Address
  onConfirm?: () => void
  onEdit?: () => void
}

const VerifyAddress = ({ addressData, onConfirm, onEdit }: VerifyAddressProps) => {
  const { handleNextStep, formData, handlePrevStep } = useFormEngineContext()
  const isPrimaryAddress = !addressData
  const address: Address = addressData ?? {
    street1: formData.primaryApplicantAddressStreet as string,
    street2: formData.primaryApplicantAddressAptOrUnit as string,
    city: formData.primaryApplicantAddressCity as string,
    state: formData.primaryApplicantAddressState as string,
    zip: formData.primaryApplicantAddressZipcode as string,
  }

  const formattedAddress = getFormattedAddress(address)
  return (
    <>
      <CardSection
        divider="inset"
        className={`${stepStyles["step-title"]} ${stepStyles["no-back"]}`}
      >
        <Heading priority={1} size="2xl">
          {t("b2aVerifyAddress.title")}
        </Heading>
      </CardSection>
      <CardSection className={styles.addressSection}>
        <Heading priority={2} size="lg">
          {formattedAddress.streets}
          <br />
          {formattedAddress.cityStateZip}
        </Heading>
        <Button variant="text" onClick={() => (isPrimaryAddress ? handlePrevStep() : onEdit?.())}>
          {t("t.edit")}
        </Button>
      </CardSection>
      <CardSection className={stepStyles["step-footer"]}>
        <Button
          variant="primary"
          onClick={() => (isPrimaryAddress ? handleNextStep() : onConfirm?.())}
        >
          {t("t.next")}
        </Button>
      </CardSection>
    </>
  )
}

export default VerifyAddress
