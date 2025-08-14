import React, { createContext, ReactNode, useContext } from "react"
import { UseFormMethods } from "react-hook-form"

export interface FormStepContext {
  register: UseFormMethods["register"]
}

export const FormStepContext = createContext<FormStepContext | undefined>(undefined)

export interface FormStepProviderProps {
  value: FormStepContext
  children: ReactNode
}

export const FormStepProvider = ({ value, children }: FormStepProviderProps) => {
  return <FormStepContext.Provider value={value}>{children}</FormStepContext.Provider>
}

export const useFormStepContext = () => {
  const context = useContext(FormStepContext)
  if (!context) {
    throw new Error("useFormStepContext() must be used within a FormStepProvider.")
  }
  return context
}
