// TODO WIP: capitalize file name per convention
import React, { useState, useMemo } from "react"
import { FormEngineProvider, type StaticData, type FormEngineContext } from "./formEngineContext"
import {
  type FormSchema,
  type StepComponentSchema,
  type StepInfoSchema,
  parseFormSchema,
  getFieldNames,
  generateInitialFormData,
} from "./formSchemas"
import RecursiveRenderer from "./recursiveRenderer"
import { calculateNextStep, calculatePrevStep, updateFormPath } from "../util/formEngineUtil"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"
import FormEngineDebug from "./FormEngineDebug"

interface FormEngineProps {
  sessionId: string
  schema: FormSchema
  staticData: StaticData
}

export type SectionInfo = {
  name: string
  stepSlugs: string[] // note: some steps are conditionally rendered
}

const FormEngineMultiStep = ({
  sessionId,
  parsedSchema,
  staticData,
  initialFormData,
  formEngineDebug,
}: {
  sessionId: string
  parsedSchema: FormSchema
  staticData: Record<string, unknown>
  initialFormData: Record<string, unknown>
  formEngineDebug: boolean
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialFormData)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({})

  const stepInfoMap: StepInfoSchema[] = useMemo(() => {
    return parsedSchema.children.map((child: StepComponentSchema) => ({
      ...child.stepInfo,
      fieldNames: getFieldNames(child),
    }))
  }, [parsedSchema])

  const sectionMap: SectionInfo[] = useMemo(() => {
    const sections: SectionInfo[] = []
    for (const stepInfo of stepInfoMap) {
      if (!stepInfo.sectionName) continue

      const sectionInfo = sections.find((section) => section.name === stepInfo.sectionName)
      if (sectionInfo) {
        sectionInfo.stepSlugs.push(stepInfo.slug)
      } else {
        sections.push({
          name: stepInfo.sectionName,
          stepSlugs: [stepInfo.slug],
        })
      }
    }
    return sections
  }, [stepInfoMap])

  const saveFormData = (data: Record<string, unknown>) => {
    setFormData({ ...formData, ...data })
  }

  // Update data changes from the current page to calculate next step
  const handleNextStep = (currentFormData?: Record<string, unknown>) => {
    const newStepIndex = calculateNextStep(
      currentStepIndex,
      stepInfoMap,
      staticData,
      currentFormData || formData
    )
    if (stepInfoMap[newStepIndex]) {
      // TODO WIP: any validation errors on a step will mark the current section as incomplete
      // so applicants can no longer jump forward to previously completed sections.
      // once the step is complete again, mark the current section as complete again

      const currentSectionName = stepInfoMap[currentStepIndex].sectionName
      const newSectionName = stepInfoMap[newStepIndex].sectionName
      if (
        currentSectionName &&
        currentSectionName !== newSectionName &&
        currentStepIndex < newStepIndex &&
        !completedSections[currentSectionName]
      ) {
        setCompletedSections((prev) => ({ ...prev, [currentSectionName]: true }))
      }

      setCurrentStepIndex(newStepIndex)
      updateFormPath(newStepIndex, stepInfoMap)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevStep = () => {
    const newStepIndex = calculatePrevStep(currentStepIndex, stepInfoMap, staticData, formData)
    if (stepInfoMap[newStepIndex]) {
      setCurrentStepIndex(newStepIndex)
      updateFormPath(newStepIndex, stepInfoMap)
      window.scrollTo(0, 0)
    }
  }

  const jumpToStep = (stepSlug: string) => {
    const stepIndex = stepInfoMap.findIndex((step) => step.slug === stepSlug)
    setCurrentStepIndex(stepIndex)
    updateFormPath(stepIndex, stepInfoMap)
    window.scrollTo(0, 0)
  }

  const formEngineContextValue: FormEngineContext = {
    sessionId,
    staticData,
    formData: formData,
    saveFormData: saveFormData,
    stepInfoMap: stepInfoMap,
    sectionMap: sectionMap,
    completedSections: completedSections,
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
          staticData={staticData}
          formData={formData}
        />
      )}
      <RecursiveRenderer schema={parsedSchema} />
    </FormEngineProvider>
  )
}

const FormEngine = ({ sessionId, schema, staticData }: FormEngineProps) => {
  const { unleashFlag: formEngineDebug } = useFeatureFlag(UNLEASH_FLAG.FORM_ENGINE_DEBUG, false)

  const parsedSchema = useMemo(() => parseFormSchema(schema), [schema])

  console.log("ASDFASDF", parsedSchema)

  if (typeof parsedSchema === "string") {
    return <h1>{parsedSchema}</h1>
  }

  if (parsedSchema.componentType === "multiStepLayout") {
    return (
      <FormEngineMultiStep
        sessionId={sessionId}
        parsedSchema={parsedSchema}
        staticData={staticData}
        initialFormData={generateInitialFormData(schema)}
        formEngineDebug={formEngineDebug}
      />
    )
  }
}

export default FormEngine
