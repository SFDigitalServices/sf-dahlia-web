// https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
/* eslint-disable @typescript-eslint/unbound-method */

import React, { Children } from "react"
import { useForm } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { FormStepProvider } from "../../../formEngine/formStepContext"
import type { DataSchema } from "../../../formEngine/formSchemas"
import { translationFromDataSchema } from "../../../util/formEngineUtil"

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

  const {
    register,
    errors,
    watch,
    trigger,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    control,
  } = useForm({
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
    <FormStepProvider
      value={{ register, errors, watch, trigger, setValue, getValues, clearErrors, control }}
    >
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <CardSection>
        <h1 className="mt-6 mb-4 text-xl md:text-2xl">{titleString}</h1>
        {description && <p className="field-note text-base">{t(description)}</p>}
        {!!descriptionComponent && descriptionComponent}
      </CardSection>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {Children.map(children, (child) => (
          <CardSection>{child}</CardSection>
        ))}
        <CardSection>
          <Button variant="primary" type="submit">
            {t("t.next")}
          </Button>
        </CardSection>
      </Form>
    </FormStepProvider>
  )
}

export default ListingApplyStepWrapper
