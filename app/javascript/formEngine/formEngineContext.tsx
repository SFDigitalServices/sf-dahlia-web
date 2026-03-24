import React, { createContext, ReactNode, useContext } from "react"
import type { StepInfoSchema } from "./formSchemas"
import type { ListingApplicationStaticData } from "../pages/form/listing-apply-form"

export type StaticData = Record<string, unknown> & ListingApplicationStaticData

export interface FormEngineContext {
  sessionId: string
  staticData: StaticData
  formData: Record<string, unknown>
  saveFormData: (formDataFragment: Record<string, unknown>) => void
  currentStepIndex: number
  stepInfoMap: StepInfoSchema[]
  sectionNames: string[]
  handleNextStep: (currentFormData?: Record<string, unknown>) => void
  handlePrevStep: () => void
  jumpToStep: (stepSlug: string) => void
}

export const FormEngineContext = createContext<FormEngineContext | undefined>(undefined)

export interface FormEngineProviderProps {
  value: FormEngineContext
  children: ReactNode
}

export const FormEngineProvider = ({ value, children }: FormEngineProviderProps) => {
  return <FormEngineContext.Provider value={value}>{children}</FormEngineContext.Provider>
}

export const useFormEngineContext = () => {
  return useContext(FormEngineContext)
}
