import React from "react"
import { Form, LoadingOverlay, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import styles from "./ListingApplyStepWrapper.module.scss"
import Phone from "./Phone"
import Address from "./Address"
import YesNoRadio from "./YesNoRadio"
import { UseFormMethods } from "react-hook-form"

interface AddressFormProps {
  loading?: boolean
  title?: string
  description?: string
  phoneLabel: string
  showTypeOfNumber: boolean
  showDontHavePhoneNumber: boolean
  showAdditionalPhoneNumber: boolean
  labelForAdditionalPhoneNumber: string
  showAptOrUnit: boolean
  addressError: string
  addressLabel: string
  addressNote: string
  showMailingAddress: boolean
  workInSfLabel: string
  workInSfNote: string
  workInSfYesText: string
  fieldNames: {
    phone: string
    phoneType: string
    additionalPhone: string
    additionalPhoneType: string
    noPhoneCheckbox: string
    additionalPhoneCheckbox: string
    addressStreet: string
    addressAptOrUnit: string
    addressCity: string
    addressState: string
    addressZipcode: string
    mailingAddressCheckbox?: string
    mailingAddressStreet?: string
    mailingAddressCity?: string
    mailingAddressState?: string
    mailingAddressZipcode?: string
    question: string
  }
  onBack: () => void
  onNext: (data: Record<string, string>) => Promise<void>
  methods: UseFormMethods<Record<string, unknown>>
}

const AddressForm = ({
  loading,
  title,
  description,
  phoneLabel,
  showTypeOfNumber,
  showDontHavePhoneNumber,
  showAdditionalPhoneNumber,
  labelForAdditionalPhoneNumber,
  showAptOrUnit,
  addressError,
  addressLabel,
  addressNote,
  showMailingAddress,
  workInSfLabel,
  workInSfNote,
  workInSfYesText,
  fieldNames,
  onBack,
  onNext,
  methods,
}: AddressFormProps) => {
  const onNextButton = () => {
    void methods.handleSubmit(() => onNext(methods.getValues() as Record<string, string>))()
  }

  return (
    <LoadingOverlay isLoading={loading}>
      <Card>
        <Card.Section>
          <Button variant="text" className={styles["back-button"]} onClick={onBack}>
            {t("t.back")}
          </Button>
        </Card.Section>
        <Card.Header divider="inset">
          <h1 className={styles["step-title"]}>{t(title)}</h1>
          {description && <p className={styles["step-description"]}>{t(description)}</p>}
        </Card.Header>
        <Form>
          <Card.Section divider="inset">
            <Phone
              label={t(phoneLabel)}
              showTypeOfNumber={showTypeOfNumber}
              showDontHavePhoneNumber={showDontHavePhoneNumber}
              showAdditionalPhoneNumber={showAdditionalPhoneNumber}
              labelForAdditionalPhoneNumber={t(labelForAdditionalPhoneNumber)}
              fieldNames={{
                phone: fieldNames.phone,
                phoneType: fieldNames.phoneType,
                additionalPhone: fieldNames.additionalPhone,
                additionalPhoneType: fieldNames.additionalPhoneType,
                noPhoneCheckbox: fieldNames.noPhoneCheckbox,
                additionalPhoneCheckbox: fieldNames.additionalPhoneCheckbox,
              }}
            />
          </Card.Section>
          <Card.Section divider="inset">
            <Address
              label={t(addressLabel)}
              note={t(addressNote)}
              showAptOrUnit={showAptOrUnit}
              requireAddress={true}
              showMailingAddress={showMailingAddress}
              addressValidationError={addressError}
              fieldNames={fieldNames}
            />
          </Card.Section>
          <Card.Section divider="inset">
            <YesNoRadio
              label={t(workInSfLabel)}
              note={t(workInSfNote)}
              yesText={t(workInSfYesText)}
              fieldNames={{
                question: fieldNames.question,
              }}
            />
          </Card.Section>
          <Card.Footer className={styles["step-footer"]}>
            <Button variant="primary" onClick={onNextButton}>
              {t("t.next")}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </LoadingOverlay>
  )
}

export default AddressForm
