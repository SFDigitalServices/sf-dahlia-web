import React from "react"
import { Dialog, Button, Heading } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { getFormattedAddress } from "../util/formEngineUtil"
import { useFormEngineContext } from "../formEngine/formEngineContext"
import styles from "./VerifyAddressModal.module.scss"

interface VerifyAddressModalProps {
  isOpen: boolean
  onClose: () => void
  verifiedAddress?: {
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }
}

const VerifyAddressModal = ({ isOpen, onClose, verifiedAddress }: VerifyAddressModalProps) => {
  const { handleNextStep, formData, saveFormData } = useFormEngineContext()
  const formattedAddress = verifiedAddress
    ? getFormattedAddress(verifiedAddress)
    : getFormattedAddress({
        street1: formData.primaryApplicantAddressStreet as string,
        street2: formData.primaryApplicantAddressAptOrUnit as string,
        city: formData.primaryApplicantAddressCity as string,
        state: formData.primaryApplicantAddressState as string,
        zip: formData.primaryApplicantAddressZipcode as string,
      })

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="verify-address-modal">
      <Dialog.Header>{t("b2aVerifyAddress.title")}</Dialog.Header>
      <Dialog.Content className={styles.addressSection}>
        <Heading priority={2} size="lg">
          {formattedAddress.streets}
          <br />
          {formattedAddress.cityStateZip}
        </Heading>
      </Dialog.Content>
      <Dialog.Footer>
        <Button
          variant="primary"
          onClick={() => {
            saveFormData({
              primaryApplicantAddressStreet: verifiedAddress?.street1,
              primaryApplicantAddressAptOrUnit: verifiedAddress?.street2,
              primaryApplicantAddressCity: verifiedAddress?.city,
              primaryApplicantAddressState: verifiedAddress?.state,
              primaryApplicantAddressZipcode: verifiedAddress?.zip,
            })
            handleNextStep()
          }}
        >
          {t("t.confirm")}
        </Button>
        <Button variant="primary-outlined" onClick={onClose}>
          {t("t.edit")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}

export default VerifyAddressModal
