import React, { Children } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import type { DataSchema } from "../../../formEngine/formSchemas"
import { translationFromDataSchema } from "../../../util/formEngineUtil"
import styles from "./ListingApplyStepWrapper.module.scss"

interface HouseholdMemberStepWrapperProps {
  title: string
  titleVars?: Record<string, DataSchema>
  description?: string
  descriptionComponent?: React.ReactNode
  children: React.ReactNode
}

const HouseholdMemberStepWrapper = ({
  title,
  titleVars,
  description,
  descriptionComponent,
  children,
}: HouseholdMemberStepWrapperProps) => {
  const formEngineContext = useFormEngineContext()
  const {
    formData,
    saveFormData,
    dataSources,
    stepInfoMap,
    currentStepIndex,
    currentMemberIndex,
    handleNextStep,
  } = formEngineContext

  const currentStepInfo = stepInfoMap[currentStepIndex]
  const householdMemberData = formData["household-member-form"]
  const householdMemberArray = Array.isArray(householdMemberData) ? householdMemberData : []
  let defaultValues = {}
  const actualMemberIndex = Math.max(0, currentMemberIndex - 1)
  const currentMemberData =
    (householdMemberArray[actualMemberIndex] as Record<string, unknown>) || {}
  defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = currentMemberData[fieldName]
    return acc
  }, {})

  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const onSubmit = (data: Record<string, unknown>) => {
    const updatedHouseholdArray = [...householdMemberArray]
    const actualMemberIndex = Math.max(0, currentMemberIndex - 1)

    while (updatedHouseholdArray.length <= actualMemberIndex) {
      updatedHouseholdArray.push({})
    }

    updatedHouseholdArray[actualMemberIndex] = {
      ...(updatedHouseholdArray[actualMemberIndex] as Record<string, unknown>),
      ...data,
    }

    const updatedFormData = {
      ...formData,
      "household-member-form": updatedHouseholdArray,
    }

    saveFormData(updatedFormData)
    handleNextStep(updatedFormData)
  }

  const titleString = translationFromDataSchema(title, titleVars, dataSources)

  return (
    <FormProvider {...methods}>
      <Card>
        <Card.Header divider="inset">
          <h1 className={styles["step-title"]}>{titleString}</h1>
          {description && <p className="field-note text-base">{t(description)}</p>}
          {!!descriptionComponent && descriptionComponent}
        </Card.Header>
        <Form onSubmit={methods.handleSubmit(onSubmit)}>
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
              {t("label.householdMemberSave")}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </FormProvider>
  )
}

export default HouseholdMemberStepWrapper
