import React, { useState } from "react"
import { FormEngineProvider, type FormEngineContext } from "./formEngineContext"
import {
  type FormSchema,
  parseFormSchema,
  getFieldNames,
  generateInitialFormData,
  generateSectionNames,
} from "./formSchemaParser"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import RecursiveRenderer from "./recursiveRenderer"

interface FormEngineProps {
  listing: RailsListing
  schema: FormSchema
}

const FormEngine = ({ listing, schema }: FormEngineProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(generateInitialFormData(schema))

  const saveFormData = (data) => {
    setFormData({ ...formData, ...data })
  }

  const parsedSchema = parseFormSchema(schema)

  if (!parsedSchema) {
    return <h1>Error parsing schema</h1>
  }

  let currentStepIndex,
    setCurrentStepIndex,
    stepInfoMap,
    sectionNames,
    handleNextStep,
    handlePrevStep
  if (parsedSchema.componentType === "multiStepLayout") {
    sectionNames = generateSectionNames(schema)

    stepInfoMap = schema.children.map((child) => {
      return {
        ...child.stepInfo,
        fieldNames: getFieldNames(child.children),
      }
    })
    ;[currentStepIndex, setCurrentStepIndex] = useState(0)

    const totalSteps = schema.children.length

    handleNextStep = () => {
      const newStepIndex = currentStepIndex + 1
      if (newStepIndex > totalSteps - 1) return
      setCurrentStepIndex(newStepIndex)
    }

    handlePrevStep = () => {
      const newStepIndex = currentStepIndex - 1
      if (newStepIndex < 0) return
      setCurrentStepIndex(newStepIndex)
    }
  }

  const formEngineContextValue: FormEngineContext = {
    listingData: listing,
    formData: formData,
    saveFormData: saveFormData,
    stepInfoMap: stepInfoMap ?? undefined,
    sectionNames: sectionNames,
    currentStepIndex: currentStepIndex ?? undefined,
    handleNextStep,
    handlePrevStep,
  }

  return (
    <FormEngineProvider value={formEngineContextValue}>
      <RecursiveRenderer schema={parsedSchema} />
    </FormEngineProvider>
  )
}

export default FormEngine
