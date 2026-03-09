import React, { createContext, ReactNode, useContext } from "react"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import type { StepInfoSchema } from "./formSchemas"

export interface DataSources {
  listing: RailsListing
  form: Record<string, unknown>
  preferences: Record<string, string>
  seniorBuildingAgeRequirement?: { entireHousehold: boolean; minimumAge: number }
}

export interface FormEngineContext {
  listing: RailsListing
  formData: Record<string, unknown>
  dataSources: DataSources
  saveFormData: (formDataFragment: Record<string, unknown>) => void
  currentStepIndex: number
  currentMemberIndex: number
  stepInfoMap: StepInfoSchema[]
  sectionNames: string[]
  handleNextStep: (currentFormData?: Record<string, unknown>) => void
  handlePrevStep: () => void
  jumpToStep: (stepIndex: number, memberIndex: number) => void
  setCurrentMemberIndex: (memberIndex: number) => void
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
