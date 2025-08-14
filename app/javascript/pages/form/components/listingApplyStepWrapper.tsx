import React from "react"
import { useForm } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { FormStepProvider } from "../../../formEngine/formStepContext"
import { type DataSchema } from "../../../formEngine/formSchemaParser"

interface ListingApplyStepWrapperProps {
  title: string
  titleVars?: DataSchema
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
    listingData,
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

  const { register, handleSubmit } = useForm({
    shouldFocusError: false,
    defaultValues,
  })

  const onSubmit = (data) => {
    saveFormData(data)
    handleNextStep()
  }

  const titleString = (title, titleVars, formData, listingData) => {
    if (!titleVars) return t(title)

    // formData.primaryApplicantFirstName === "Jane"
    // { name: { dataSource: "form", key: "primaryApplicantFirstName" } } -> { name: "Jane" }
    const translationVars = {}
    for (const varName in titleVars) {
      const { dataSource, dataKey } = titleVars[varName]
      const data = { form: formData, listing: listingData }[dataSource]
      translationVars[varName] = data[dataKey]
    }
    return t(title, translationVars)
  }

  return (
    <FormStepProvider value={{ register }}>
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <CardSection>
        <h1 className="mt-6 mb-4 text-xl md:text-2xl">
          {titleString(title, titleVars, formData, listingData)}
        </h1>
        {description && <p className="field-note text-base">{t(description)}</p>}
        {!!descriptionComponent && descriptionComponent}
      </CardSection>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <CardSection>{children}</CardSection>
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
