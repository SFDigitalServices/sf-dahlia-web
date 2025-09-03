import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"
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
    <Card>
      <Card.Header>Name Component</Card.Header>
      <Card.Section>
        <fieldset>
          <Field name={fieldNames.firstName} label={t(label)} register={register} />
        </fieldset>
      </Card.Section>
    </Card>
  )
}

export default Name
