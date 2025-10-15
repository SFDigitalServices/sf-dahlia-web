import React, { createContext, ReactNode, useContext } from "react"
import { UseFormMethods } from "react-hook-form"

export interface FormStepContext {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  watch: UseFormMethods["watch"]
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
  return useContext(FormStepContext)
}
