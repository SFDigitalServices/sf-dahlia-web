import React, { useState } from "react"
import { FormEngineProvider, type FormEngineContext } from "./formEngineContext"
import {
  type FormSchema,
  type StepComponentSchema,
  parseFormSchema,
  getFieldNames,
  generateInitialFormData,
  generateSectionNames,
} from "./formSchemas"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import RecursiveRenderer from "./recursiveRenderer"

interface FormEngineProps {
  listing: RailsListing
  schema: FormSchema
}

const FormEngine = ({ listing, schema }: FormEngineProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(generateInitialFormData(schema))
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)

  const parsedSchema = parseFormSchema(schema)
  if (!parsedSchema) {
    return <h1>Error parsing schema</h1>
  }

  const saveFormData = (data: Record<string, unknown>) => {
    setFormData({ ...formData, ...data })
  }

  let stepInfoMap, sectionNames, handleNextStep, handlePrevStep
  if (parsedSchema.componentType === "multiStepLayout") {
    sectionNames = generateSectionNames(parsedSchema)
    stepInfoMap = parsedSchema.children.map((child: StepComponentSchema) => {
      return {
        ...child.stepInfo,
        fieldNames: getFieldNames(child),
      }
    })
    const totalSteps = parsedSchema.children.length
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
    stepInfoMap: stepInfoMap,
    sectionNames: sectionNames,
    currentStepIndex: currentStepIndex,
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
