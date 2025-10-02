import React from "react"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"
import { useFormStepContext } from "../../../formEngine/formStepContext"

interface YesNoRadioProps {
  label?: string
  note?: string
  description?: string
  yesText?: string
  fieldNames?: {
    question?: string
  }
}

const YesNoRadio = ({ label, note, description, yesText, fieldNames }: YesNoRadioProps) => {
  const { register, errors } = useFormStepContext()
  return (
    <Card>
      <Card.Section>{t(label)}</Card.Section>
      <Card.Section>
        <fieldset>
          <FieldGroup
            fieldGroupClassName="grid grid-cols-1"
            fieldClassName="ml-0"
            type="radio"
            name={fieldNames?.question}
            groupNote={t(note)}
            error={errors?.[fieldNames?.question]}
            errorMessage={t("errorMessage")}
            register={register}
            fields={[
              { id: "yes", value: "true", label: t("t.yes") },
              { id: "no", value: "false", label: t("t.no") },
            ]}
            validation={{
              required: true,
            }}
          />
        </fieldset>
      </Card.Section>
    </Card>
  )
}

export default YesNoRadio
