import React from "react"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import styles from "./YesNoRadio.module.scss"

interface YesNoRadioProps {
  label?: string
  note?: string
  yesText?: string
  fieldNames?: {
    question?: string
  }
}

const YesNoRadio = ({ label, note, yesText, fieldNames }: YesNoRadioProps) => {
  const { register, errors, watch } = useFormStepContext()
  const selected = watch(fieldNames?.question)
  return (
    <FieldGroup
      fieldGroupClassName={`${styles['radio-field-group']} ${styles['radio-field']}`}
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
