import React from "react"
import "./account-settings.scss"

interface FieldsetProps {
  label: string
  hasError?: boolean
  children: React.ReactNode
  className?: string
}

const Fieldset = ({ hasError, label, children, className }: FieldsetProps) => {
  return (
    <fieldset className={className ?? "form-fieldset"}>
      <legend className={hasError ? "fieldset-legend text-alert" : "fieldset-legend"}>
        {label}
      </legend>
      {children}
    </fieldset>
  )
}

export default Fieldset
