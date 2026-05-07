// https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
import React, { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import type { DataSchema } from "../../../formEngine/formSchemas"
import { getAddressErrorEmailLink, translationFromDataSchema } from "../../../util/formEngineUtil"
import styles from "./ListingApplyStepWrapper.module.scss"
import ListingApplyStepErrorMessage from "./ListingApplyStepErrorMessage"
import { locateVerifiedAddress } from "../../../api/formApiService"
import YesNoRadio from "./YesNoRadio"
import Phone from "./Phone"
import Address from "./Address"

interface ListingContactStepWrapperProps {
  title: string
  titleVars?: Record<string, DataSchema>
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
    mailingAddressCheckbox: string
    mailingAddressStreet: string
    mailingAddressCity: string
    mailingAddressState: string
    mailingAddressZipcode: string
    question: string
  }
}

const ListingContactStepWrapper = ({
  title,
  titleVars,
  fieldNames: {
    phone,
    phoneType,
    additionalPhone,
    additionalPhoneType,
    noPhoneCheckbox,
    additionalPhoneCheckbox,
    addressStreet,
    addressAptOrUnit,
    addressCity,
    addressState,
    addressZipcode,
    mailingAddressCheckbox,
    mailingAddressStreet,
    mailingAddressCity,
    mailingAddressState,
    mailingAddressZipcode,
    question,
  },
}: ListingContactStepWrapperProps) => {
  const formEngineContext = useFormEngineContext()
  const {
    staticData,
    formData,
    saveFormData,
    stepInfoMap,
    currentStepIndex,
    handleNextStep,
    handlePrevStep,
  } = formEngineContext

  const currentStepInfo = stepInfoMap[currentStepIndex]
  const defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = formData[fieldName]
    return acc
  }, {})

  const formMethods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null)
  useEffect(() => {
    if (Object.keys(formMethods.formState.errors).length > 0 || apiErrorMessage) {
      window.scrollTo(0, 0)
    }
  }, [formMethods.formState.errors, apiErrorMessage])

  const onSubmit = (data: Record<string, unknown>) => {
    saveFormData(data)
    formMethods.clearErrors()
    locateVerifiedAddress({
      street1: data[addressStreet] as string,
      street2: data[addressAptOrUnit] as string,
      city: data[addressCity] as string,
      state: data[addressState] as string,
      zip: data[addressZipcode] as string,
    })
      .then((response) => {
        saveFormData({
          ...data,
          [addressStreet]: response.address?.street1,
          [addressAptOrUnit]: response.address?.street2,
          [addressCity]: response.address?.city,
          [addressState]: response.address?.state,
          [addressZipcode]: response.address?.zip,
        })
        handleNextStep({ ...formData, ...data })
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          setApiErrorMessage(
            t("error.addressValidation.notFound", {
              mailParams: getAddressErrorEmailLink(data, staticData, formData),
            })
          )
        } else {
          setApiErrorMessage(t("error.alert.badRequest"))
        }
      })
  }
  return (
    <FormProvider {...formMethods}>
      <Card>
        <Card.Section>
          <Button variant="text" className={styles["back-button"]} onClick={handlePrevStep}>
            {t("t.back")}
          </Button>
        </Card.Section>
        <Card.Header divider="inset">
          <h1 className={styles["step-title"]}>
            {translationFromDataSchema(title, titleVars, staticData, formData)}
          </h1>
        </Card.Header>
        {(Object.keys(formMethods.formState.errors).length > 0 || apiErrorMessage) && (
          <ListingApplyStepErrorMessage
            errorMessage={t("error.formSubmission")}
            onClose={() => {
              formMethods.clearErrors()
              setApiErrorMessage(null)
            }}
          />
        )}
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Card.Section>
            <Phone
              label="label.applicantPhone"
              showTypeOfNumber={true}
              showDontHavePhoneNumber={true}
              showAdditionalPhoneNumber={true}
              labelForAdditionalPhoneNumber="label.applicantSecondPhone"
              fieldNames={{
                phone,
                phoneType,
                additionalPhone,
                additionalPhoneType,
                noPhoneCheckbox,
                additionalPhoneCheckbox,
              }}
            />
          </Card.Section>
          <Card.Section>
            <Address
              showAptOrUnit={true}
              requireAddress={true}
              verifyAddress={true}
              label="label.address"
              note="b2Contact.applicantAddressDesc"
              showMailingAddress={true}
              addressError={apiErrorMessage}
              fieldNames={{
                addressStreet,
                addressAptOrUnit,
                addressCity,
                addressState,
                addressZipcode,
                mailingAddressCheckbox,
                mailingAddressStreet,
                mailingAddressCity,
                mailingAddressState,
                mailingAddressZipcode,
              }}
            />
          </Card.Section>
          <Card.Section>
            <YesNoRadio
              label="label.workInSf"
              note="b2Contact.workInSfDesc"
              yesText="b2Contact.claimWorkInSf"
              fieldNames={{ question }}
            />
          </Card.Section>
          <Card.Footer className={styles["step-footer"]}>
            <Button variant="primary" type="submit">
              {t("t.next")}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </FormProvider>
  )
}

export default ListingContactStepWrapper
