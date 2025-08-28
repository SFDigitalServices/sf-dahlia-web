import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormStepContext } from "../../../formEngine/formStepContext"

interface NameProps {
  label: string
  fieldNames: {
    firstName: string
    middleName: string
    lastName: string
  }
}

const Name = ({ label, fieldNames }: NameProps) => {
  const { register } = useFormStepContext()

  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>Name Component</p>
      <fieldset>
        <Field name={fieldNames.firstName} label={t(label)} register={register} />
      </fieldset>
    </div>
  )
}

export default Name
