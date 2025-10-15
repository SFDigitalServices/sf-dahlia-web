import React from "react"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import "./YesNoRadio.scss"

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
  const { register, errors, watch } = useFormStepContext()
  const selected = watch(fieldNames?.question)
  return (
    <Card>
      <Card.Section>{t(label)}</Card.Section>
      <Card.Section>
        <fieldset>
          <FieldGroup
            fieldGroupClassName="radio-field-group"
            fieldClassName="radio-field"
            type="radio"
            name={fieldNames?.question}
            groupLabel={t(description)}
            groupNote={t(note)}
            {...(selected === "true" && { groupSubNote: t(yesText) })}
            error={errors?.[fieldNames?.question]}
            errorMessage={t("error.pleaseSelectAnOption")}
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
