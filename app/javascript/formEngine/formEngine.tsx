import React, { useState } from "react"
import { FormEngineProvider, type FormEngineContext } from "./formEngineContext"
import {
  type FormSchema,
  type StepComponentSchema,
  type StepInfoSchema,
  parseFormSchema,
  getFieldNames,
  generateInitialFormData,
  generateSectionNames,
} from "./formSchemas"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import { listingPreferences } from "../util/listingUtil"
import RecursiveRenderer from "./recursiveRenderer"
import { calculateNextStep, calculatePrevStep } from "../util/formEngineUtil"

interface FormEngineProps {
  listing: RailsListing
  schema: FormSchema
}

const FormEngine = ({ listing, schema }: FormEngineProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(generateInitialFormData(schema))
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)

  const parsedSchema = parseFormSchema(schema)
  if (typeof parsedSchema === "string") {
    return <h1>{parsedSchema}</h1>
  }

  const saveFormData = (data: Record<string, unknown>) => {
    setFormData({ ...formData, ...data })
  }

  const dataSources = {
    listing,
    form: formData,
    preferences: listingPreferences(listing),
  }

  let stepInfoMap: StepInfoSchema[],
    sectionNames: string[],
    handleNextStep: () => void,
    handlePrevStep: () => void
  if (parsedSchema.componentType === "multiStepLayout") {
    sectionNames = generateSectionNames(parsedSchema)
    stepInfoMap = parsedSchema.children.map((child: StepComponentSchema) => ({
      ...child.stepInfo,
      fieldNames: getFieldNames(child),
    }))
    const totalSteps = parsedSchema.children.length
    console.log(stepInfoMap)
    handleNextStep = () => {
      const newStepIndex = calculateNextStep(currentStepIndex, stepInfoMap, dataSources)
      if (newStepIndex < totalSteps) setCurrentStepIndex(newStepIndex)
    }
    handlePrevStep = () => {
      const newStepIndex = calculatePrevStep(currentStepIndex, stepInfoMap, dataSources)
      if (newStepIndex >= 0) setCurrentStepIndex(newStepIndex)
    }
  }

  const formEngineContextValue: FormEngineContext = {
    listing,
    formData: formData,
    dataSources,
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
