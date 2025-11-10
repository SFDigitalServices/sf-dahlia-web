import React from "react"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"
import "./YesNoRadio.scss"

interface YesNoRadioProps {
  label?: string
  note?: string
  yesText?: string
  fieldNames?: {
    question?: string
  }
}

const YesNoRadio = ({ label, note, yesText, fieldNames }: YesNoRadioProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, watch } = useFormContext()
  const selected = watch(fieldNames?.question)
  return (
    <FieldGroup
      fieldGroupClassName="radio-field-group"
      fieldClassName="radio-field"
      type="radio"
      name={fieldNames?.question}
      groupLabel={t(label)}
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
  )
}

export default YesNoRadio
