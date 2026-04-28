import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import VerifyAddress from "./VerifyAddress"
import AddressForm from "./AddressForm"
import { locateVerifiedAddress } from "../../../api/formApiService"
import { getFormattedAddress } from "../../../util/formEngineUtil"

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
  const [loading, setLoading] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [verifyAddress, setVerifyAddress] = useState(true)
  const { formData, handlePrevStep, staticData, saveFormData, stepInfoMap, currentStepIndex } =
    useFormEngineContext()

  const currentStepInfo = stepInfoMap[currentStepIndex]
  const defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = formData[fieldName]
    return acc
  }, {})

  const methods = useForm({
    mode: "onChange",
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

  const onNext = async (data: Record<string, unknown>) => {
    saveFormData({ ...data })
    setAddressError(null)
    setLoading(true)
    try {
      const response = await locateVerifiedAddress({
        street1: data[fieldNames.addressStreet] as string,
        street2: data[fieldNames.addressAptOrUnit] as string,
        city: data[fieldNames.addressCity] as string,
        state: data[fieldNames.addressState] as string,
        zip: data[fieldNames.addressZipcode] as string,
      })
      if (response.address?.invalid) {
        setAddressError(t("error.addressValidation.notFound", { href: getAddressErrorEmailLink() }))
      }
      if (response.error) {
        setAddressError(t(response.error))
      }
      saveFormData({
        ...data,
        [fieldNames.addressStreet]: response.address?.street1,
        [fieldNames.addressAptOrUnit]: response.address?.street2,
        [fieldNames.addressCity]: response.address?.city,
        [fieldNames.addressState]: response.address?.state,
        [fieldNames.addressZipcode]: response.address?.zip,
      })
      setVerifyAddress(true)
    } catch (error) {
      console.error(error)
      alert(t("error.alert.badRequest"))
    } finally {
      setLoading(false)
    }
  }

  return verifyAddress === true && !loading ? (
    <VerifyAddress onEdit={() => setVerifyAddress(false)} />
  ) : (
    <FormProvider {...methods}>
      <AddressForm
        loading={loading}
        title={title}
        description={description}
        phoneLabel={phoneLabel}
        showTypeOfNumber={showTypeOfNumber}
        showDontHavePhoneNumber={showDontHavePhoneNumber}
        showAdditionalPhoneNumber={showAdditionalPhoneNumber}
        labelForAdditionalPhoneNumber={labelForAdditionalPhoneNumber}
        showAptOrUnit={showAptOrUnit}
        addressError={addressError}
        addressLabel={addressLabel}
        addressNote={addressNote}
        showMailingAddress={showMailingAddress}
        workInSfLabel={workInSfLabel}
        workInSfNote={workInSfNote}
        workInSfYesText={workInSfYesText}
        fieldNames={fieldNames}
        onBack={handlePrevStep}
        onNext={onNext}
        methods={methods}
      />
    </FormProvider>
  )
}

export default ListingAddressMultiStepWrapper
