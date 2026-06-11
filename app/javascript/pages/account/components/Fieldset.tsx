import React from "react"
import "../styles/account.scss"
interface FieldsetProps {
  label: string
  hasError?: boolean
  children: React.ReactNode
  note?: React.ReactNode
  className?: string
}

const Fieldset = ({ hasError, label, children, note, className }: FieldsetProps) => {
  return (
    <fieldset className={`form-fieldset w-full${className ? ` ${className}` : ""}`}>
      <legend className={hasError ? "fieldset-legend text-alert" : "fieldset-legend"}>
        {label}
      </legend>
      {note && <div className="pb-2 field-note">{note}</div>}
      {children}
    </fieldset>
  )
}

export default Fieldset
