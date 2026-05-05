import React, { Children, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import type { DataSchema } from "../../../formEngine/formSchemas"
import { translationFromDataSchema } from "../../../util/formEngineUtil"
import styles from "./ListingApplyStepWrapper.module.scss"
import getFormComponentRegistry from "../../../formEngine/formComponentRegistry"
import ListingApplyStepErrorMessage from "./ListingApplyStepErrorMessage"

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

  useEffect(() => {
    if (Object.keys(formMethods.formState.errors).length > 0) {
      window.scrollTo(0, 0)
    }
  }, [formMethods.formState.errors])

  const onSubmit = (data: Record<string, unknown>) => {
    saveFormData({ ...blankValues, ...data })
    handleNextStep({ ...formData, ...blankValues, ...data })
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
        {Object.keys(formMethods.formState.errors).length > 0 && (
          <ListingApplyStepErrorMessage
            errorMessage={t("error.formSubmission")}
            onClose={() => formMethods.clearErrors()}
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
