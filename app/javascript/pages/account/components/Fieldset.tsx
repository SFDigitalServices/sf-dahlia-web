import React from "react"
interface FieldsetProps {
  label: string
  hasError?: boolean
  children: React.ReactNode
  note?: React.ReactNode
}

const Fieldset = ({ hasError, label, children, note }: FieldsetProps) => {
  return (
    <fieldset className="form-fieldset">
      <legend className={hasError ? "fieldset-legend text-alert" : "fieldset-legend"}>
        {label}
      </legend>
      {note && <div className="pb-2 field-note">{note}</div>}
      {children}
    </fieldset>
  )
}

export default Fieldset