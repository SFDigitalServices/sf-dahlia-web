import React, { Children } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./ListingApplyStepWrapper.module.scss"

interface HouseholdMemberStepWrapperProps {
  title: string
  description: string
  children: React.ReactNode
}

const HouseholdMemberStepWrapper = ({
  title,
  description,
  children,
}: HouseholdMemberStepWrapperProps) => {
  const {
    formData,
    saveFormData,
    stepInfoMap,
    currentStepIndex,
    currentMemberIndex,
    handleNextStep,
  } = useFormEngineContext()
  const currentStepInfo = stepInfoMap[currentStepIndex]
  const householdMemberArray =
    (formData["household-member-form"] as Record<string, unknown>[]) || []
  const currentMemberData = householdMemberArray[currentMemberIndex - 1] || {}

  const defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
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
    updatedHouseholdArray[currentMemberIndex - 1] = {
      ...updatedHouseholdArray[currentMemberIndex - 1],
      ...data,
    }
    saveFormData({
      ...formData,
      "household-member-form": updatedHouseholdArray,
    })
    handleNextStep({
      ...formData,
      "household-member-form": updatedHouseholdArray,
    })
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <Card.Header divider="inset">
          <h1 className={styles["step-title"]}>{t(title)}</h1>
          <p className="field-note text-base">{t(description)}</p>
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
