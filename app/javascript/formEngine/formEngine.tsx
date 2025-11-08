import React, { useState, useMemo } from "react"
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
import type { RailsListingPreference } from "../api/types/rails/listings/RailsListingPreferences"
import { getSeniorBuildingAgeRequirement } from "../util/listingUtil"
import RecursiveRenderer from "./recursiveRenderer"
import { calculateNextStep, calculatePrevStep, updateFormPath } from "../util/formEngineUtil"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"
import FormEngineDebug from "./FormEngineDebug"

interface FormEngineProps {
  listing: RailsListing
  preferences: RailsListingPreference[]
  schema: FormSchema
}

const FormEngine = ({ listing, preferences, schema }: FormEngineProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(generateInitialFormData(schema))
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const { unleashFlag: formEngineDebug } = useFeatureFlag(UNLEASH_FLAG.FORM_ENGINE_DEBUG, false)
  const parsedSchema = parseFormSchema(schema)

  const dataSources = useMemo(
    () => ({
      listing,
      form: formData,
      preferences,
      seniorBuildingAgeRequirement: getSeniorBuildingAgeRequirement(listing),
    }),
    [listing, formData]
  )

  if (typeof parsedSchema === "string") {
    return <h1>{parsedSchema}</h1>
  }

  const saveFormData = (data: Record<string, unknown>) => {
    setFormData({ ...formData, ...data })
  }

  let stepInfoMap: StepInfoSchema[],
    sectionNames: string[],
    handleNextStep: (currentFormData: Record<string, unknown>) => void,
    handlePrevStep: () => void,
    jumpToStep: (stepSlug: string) => void

  if (parsedSchema.componentType === "multiStepLayout") {
    sectionNames = generateSectionNames(parsedSchema)
    stepInfoMap = parsedSchema.children.map((child: StepComponentSchema) => ({
      ...child.stepInfo,
      fieldNames: getFieldNames(child),
    }))
    const totalSteps = parsedSchema.children.length

    // Update data changes from the current page to calculate next step
    handleNextStep = (currentFormData: Record<string, unknown>) => {
      const newStepIndex = calculateNextStep(currentStepIndex, stepInfoMap, {
        ...dataSources,
        form: currentFormData,
      })
      if (newStepIndex < totalSteps) {
        setCurrentStepIndex(newStepIndex)
        updateFormPath(newStepIndex, stepInfoMap)
      }
    }

    handlePrevStep = () => {
      const newStepIndex = calculatePrevStep(currentStepIndex, stepInfoMap, dataSources)
      if (newStepIndex >= 0) {
        setCurrentStepIndex(newStepIndex)
        updateFormPath(newStepIndex, stepInfoMap)
      }
    }

    jumpToStep = (stepSlug: string) => {
      const stepIndex = stepInfoMap.findIndex((step) => step.slug === stepSlug)
      setCurrentStepIndex(stepIndex)
      updateFormPath(stepIndex, stepInfoMap)
    }
  }

  const formEngineContextValue: FormEngineContext = {
    listing,
    preferences,
    formData: formData,
    sessionId: self.crypto.randomUUID(), // ShortFormApplicationService.js.coffee#L19
    dataSources,
    saveFormData: saveFormData,
    stepInfoMap: stepInfoMap,
    sectionNames: sectionNames,
    currentStepIndex: currentStepIndex,
    handleNextStep,
    handlePrevStep,
    jumpToStep,
  }

  return (
    <FormEngineProvider value={formEngineContextValue}>
      {formEngineDebug && (
        <FormEngineDebug
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
          stepInfoMap={stepInfoMap}
          dataSources={dataSources}
        />
      )}
      <RecursiveRenderer schema={parsedSchema} />
    </FormEngineProvider>
  )
}

export default FormEngine
