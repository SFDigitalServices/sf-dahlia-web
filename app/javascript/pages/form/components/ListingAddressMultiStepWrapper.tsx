import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import VerifyAddressModal from "../../../components/VerifyAddressModal"
import { locateVerifiedAddress } from "../../../api/formApiService"
import { getFormattedAddress } from "../../../util/formEngineUtil"
import styles from "./ListingApplyStepWrapper.module.scss"
import Phone from "./Phone"
import Address from "./Address"
import YesNoRadio from "./YesNoRadio"

interface ListingAddressMultiStepWrapperProps {
  title?: string
  description?: string
  phoneLabel: string
  showTypeOfNumber: boolean
  showDontHavePhoneNumber: boolean
  showAdditionalPhoneNumber: boolean
  labelForAdditionalPhoneNumber: string
  showAptOrUnit: boolean
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
}

const ListingAddressMultiStepWrapper = ({
  title,
  description,
  phoneLabel,
  showTypeOfNumber,
  showDontHavePhoneNumber,
  showAdditionalPhoneNumber,
  labelForAdditionalPhoneNumber,
  showAptOrUnit,
  addressLabel,
  addressNote,
  showMailingAddress,
  workInSfLabel,
  workInSfNote,
  workInSfYesText,
  fieldNames,
}: ListingAddressMultiStepWrapperProps) => {
  const [addressError, setAddressError] = useState(null)
  const [verifiedResponse, setVerifiedResponse] = useState(null)
  const { formData, handlePrevStep, staticData, saveFormData, stepInfoMap, currentStepIndex } =
    useFormEngineContext()
  const currentStepInfo = stepInfoMap[currentStepIndex]
  const defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = formData[fieldName]
    return acc
  }, {})

  const methods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const getAddressErrorEmailLink = () => {
    const mailParams = {
      subject: `[Invalid Address Error] ${t("error.addressValidation.notFoundSubject")}`,
      body: t("error.addressValidation.notFoundBody", {
        listing_name: staticData.listing?.Name,
        home_address: getFormattedAddress({
          street1: formData[fieldNames.addressStreet] as string,
          street2: formData[fieldNames.addressAptOrUnit] as string,
          city: formData[fieldNames.addressCity] as string,
          state: formData[fieldNames.addressState] as string,
          zip: formData[fieldNames.addressZipcode] as string,
        }),
        first_name: formData.primaryApplicantFirstName,
        last_name: formData.primaryApplicantLastName,
        email: formData.primaryApplicantEmail,
        phone_number: formData.primaryApplicantPhone,
      }),
    }
    return `${"mailto:lotteryappeal@sfgov.org"}?${new URLSearchParams(mailParams).toString()}`
  }

  const handleAddressVerification = async (data: Record<string, unknown>) => {
    try {
      setAddressError(null)
      const addressData = {
        street1: data[fieldNames.addressStreet] as string,
        street2: data[fieldNames.addressAptOrUnit] as string,
        city: data[fieldNames.addressCity] as string,
        state: data[fieldNames.addressState] as string,
        zip: data[fieldNames.addressZipcode] as string,
      }
      const response = await locateVerifiedAddress(addressData)
      if (response.address?.invalid) {
        setAddressError(t("error.addressValidation.notFound", { href: getAddressErrorEmailLink() }))
      }
      if (response.error) {
        setAddressError(t(response.error))
      }
      return response
    } catch {
      alert(t("error.alert.badRequest"))
      return null
    }
  }

  const onNext = (data: Record<string, unknown>) => {
    handleAddressVerification(data)
      .then((response) => {
        if (response) {
          setVerifiedResponse(response)
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const onClose = () => {
    if (verifiedResponse) {
      saveFormData({
        [fieldNames.addressStreet]: verifiedResponse.address?.street1,
        [fieldNames.addressAptOrUnit]: verifiedResponse.address?.street2,
        [fieldNames.addressCity]: verifiedResponse.address?.city,
        [fieldNames.addressState]: verifiedResponse.address?.state,
        [fieldNames.addressZipcode]: verifiedResponse.address?.zip,
      })
      setVerifiedResponse(null)
    }
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <Card.Section>
          <Button variant="text" className={styles["back-button"]} onClick={handlePrevStep}>
            {t("t.back")}
          </Button>
        </Card.Section>
        <Card.Header divider="inset">
          <h1 className={styles["step-title"]}>{t(title)}</h1>
          {description && <p className={styles["step-description"]}>{t(description)}</p>}
        </Card.Header>
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
          <Button variant="primary" onClick={() => onNext(methods.getValues())}>
            {t("t.next")}
          </Button>
        </Card.Footer>
      </Card>
      <VerifyAddressModal
        isOpen={verifiedResponse !== null}
        onClose={onClose}
        verifiedAddress={verifiedResponse?.address}
      />
    </FormProvider>
  )
}

export default ListingAddressMultiStepWrapper
