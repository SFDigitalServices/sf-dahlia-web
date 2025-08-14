import React, { createContext, ReactNode, useContext } from "react"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import type { StepInfoSchema } from "./formSchemaParser"

export interface FormEngineContext {
  listingData?: RailsListing
  formData: Record<string, any>
  saveFormData: (formDataFragment: Record<string, any>) => void
  currentStepIndex?: number
  stepInfoMap: StepInfoSchema[]
  sectionNames: string[]
  handleNextStep: () => void
  handlePrevStep: () => void
}

const defaultFormEngineContext: FormEngineContext = {
  formData: {},
  saveFormData: () => {
    console.warn("setFormData called but no FormEngineContext.Provider was found.")
  },
  currentStepIndex: 0,
  stepInfoMap: [],
  sectionNames: [],
  handleNextStep: () => {
    console.warn("handleNextStep called but no FormEngineContext.Provider was found.")
  },
  handlePrevStep: () => {
    console.warn("handlePrevStep called but no FormEngineContext.Provider was found.")
  },
}

export const FormEngineContext = createContext<FormEngineContext | undefined>(
  defaultFormEngineContext
)

export interface FormEngineProviderProps {
  value: FormEngineContext
  children: ReactNode
}

export const FormEngineProvider = ({ value, children }: FormEngineProviderProps) => {
  return <FormEngineContext.Provider value={value}>{children}</FormEngineContext.Provider>
}

export const useFormEngineContext = () => {
  const context = useContext(FormEngineContext)
  if (!context) {
    throw new Error("useFormEngine() must be used within a FormEngineProvider.")
  }
  return context
}
