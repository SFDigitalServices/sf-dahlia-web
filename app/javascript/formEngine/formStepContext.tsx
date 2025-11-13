import React, { createContext, ReactNode, useContext } from "react"
import { UseFormMethods } from "react-hook-form"

export interface FormStepContext {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  watch: UseFormMethods["watch"]
  trigger: UseFormMethods["trigger"]
  setValue: UseFormMethods["setValue"]
  getValues: UseFormMethods["getValues"]
  clearErrors: UseFormMethods["clearErrors"]
  control: UseFormMethods["control"]
}

export const FormStepContext = createContext<FormStepContext | undefined>(undefined)

export interface FormStepProviderProps {
  value: FormStepContext
  children: ReactNode
}

// TODO: replace with react-hook-form FormProvider
export const FormStepProvider = ({ value, children }: FormStepProviderProps) => {
  return <FormStepContext.Provider value={value}>{children}</FormStepContext.Provider>
}

export const useFormStepContext = () => {
  return useContext(FormStepContext)
}
