// https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
import React, { useState, Children } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import type { DataSchema } from "../../../formEngine/formSchemas"
import { translationFromDataSchema } from "../../../util/formEngineUtil"
import styles from "./ListingApplyStepWrapper.module.scss"
import getFormComponentRegistry from "../../../formEngine/formComponentRegistry"
import ListingApplyStepErrorMessage from "./ListingApplyStepErrorMessage"
import { locateVerifiedAddress } from "../../../api/formApiService"

interface ListingApplyStepWrapperProps {
  title: string
  titleVars?: Record<string, DataSchema>
  headerComponentName?: string
  description?: string
  children: React.ReactNode
}

const ListingApplyStepWrapper = ({
  title,
  titleVars,
  headerComponentName,
  description,
  children,
}: ListingApplyStepWrapperProps) => {
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

  // used to clear values for some types of fields that get un-rendered and therefore get de-registered from react-hook-form
  const blankValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = null
    return acc
  }, {})

  const shouldVerifyAddress = Children.toArray(children).find((child) => {
    return (child as React.ReactElement).props.schema.props.verifyAddress === true
  })

  let headerComponent
  if (headerComponentName) {
    const componentRegistry = getFormComponentRegistry()
    headerComponent = React.createElement(componentRegistry[headerComponentName])
  }

  const formMethods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const hasErrors = () => Object.keys(formMethods.formState.errors).length > 0
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null)

  const onSubmit = (data: Record<string, unknown>) => {
    saveFormData({ ...blankValues, ...data })
    if (shouldVerifyAddress) {
      formMethods.clearErrors()
      locateVerifiedAddress({
        street1: data.primaryApplicantAddressStreet as string,
        street2: data.primaryApplicantAddressAptOrUnit as string,
        city: data.primaryApplicantAddressCity as string,
        state: data.primaryApplicantAddressState as string,
        zip: data.primaryApplicantAddressZipcode as string,
      })
        .then((response) => {
          saveFormData({
            primaryApplicantStreet: response.address?.street1,
            primaryApplicantAptOrUnit: response.address?.street2,
            primaryApplicantCity: response.address?.city,
            primaryApplicantState: response.address?.state,
            primaryApplicantZipcode: response.address?.zip,
          })
          handleNextStep({ ...formData, ...blankValues, ...data })
        })
        .catch((error) => {
          if (error.response?.status === 422) {
            setApiErrorMessage(t("error.addressValidation.notFound"))
          }
        })
    } else {
      handleNextStep({ ...formData, ...blankValues, ...data })
    }
  }

  const titleString = translationFromDataSchema(title, titleVars, staticData, formData)

  return (
    <FormProvider {...formMethods}>
      <Card>
        <Card.Section>
          <Button variant="text" className={styles["back-button"]} onClick={handlePrevStep}>
            {t("t.back")}
          </Button>
        </Card.Section>
        {headerComponent ? (
          <>{headerComponent}</>
        ) : (
          <Card.Header divider="inset">
            <h1 className={styles["step-title"]}>{titleString}</h1>
            {description && <p className={styles["step-description"]}>{t(description)}</p>}
          </Card.Header>
        )}
        {hasErrors() && (
          <ListingApplyStepErrorMessage
            errorMessage={apiErrorMessage || t("error.formSubmission")}
            onClose={() => {
              formMethods.clearErrors()
              setApiErrorMessage(null)
            }}
          />
        )}
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {Children.map(children, (child) => {
            const { schema } = (child as React.ReactElement).props
            return (
              <Card.Section divider={schema?.props?.divider === false ? undefined : "inset"}>
                {child}
              </Card.Section>
            )
          })}
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

export default ListingApplyStepWrapper
