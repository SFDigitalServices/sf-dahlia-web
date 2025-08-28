import React, { createContext, ReactNode, useContext } from "react"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import type { StepInfoSchema } from "./formSchemas"

export interface FormEngineContext {
  listingData: RailsListing
  formData: Record<string, unknown>
  saveFormData: (formDataFragment: Record<string, unknown>) => void
  currentStepIndex: number
  stepInfoMap: StepInfoSchema[]
  sectionNames: string[]
  handleNextStep: () => void
  handlePrevStep: () => void
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
