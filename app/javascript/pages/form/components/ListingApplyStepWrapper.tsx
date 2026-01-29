// https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
/* eslint-disable @typescript-eslint/unbound-method */

import React, { Children } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import type { DataSchema } from "../../../formEngine/formSchemas"
import { translationFromDataSchema } from "../../../util/formEngineUtil"
import styles from "./ListingApplyStepWrapper.module.scss"

interface ListingApplyStepWrapperProps {
  title: string
  titleVars?: Record<string, DataSchema>
  description?: string
  descriptionComponent?: React.ReactNode
  children: React.ReactNode
}

const ListingApplyStepWrapper = ({
  title,
  titleVars,
  description,
  descriptionComponent,
  children,
}: ListingApplyStepWrapperProps) => {
  const formEngineContext = useFormEngineContext()
  const {
    formData,
    saveFormData,
    dataSources,
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

  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const onSubmit = (data: Record<string, unknown>) => {
    saveFormData(data)
    handleNextStep()
  }

  const titleString = translationFromDataSchema(title, titleVars, dataSources)

  return (
    <FormProvider {...methods}>
      <Card>
        <Card.Section>
          <Button variant="text" onClick={handlePrevStep}>
            {t("t.back")}
          </Button>
        </Card.Section>
        <Card.Header divider="inset">
          <h1 className={styles["step-title"]}>{titleString}</h1>
          {description && <p className="field-note text-base">{t(description)}</p>}
          {!!descriptionComponent && descriptionComponent}
        </Card.Header>
        <Form onSubmit={methods.handleSubmit(onSubmit)}>
          {Children.map(children, (child) => (
            <Card.Section>{child}</Card.Section>
          ))}
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
