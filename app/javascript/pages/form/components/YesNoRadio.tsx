/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"
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
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext()
  const selected = watch(fieldNames?.question)
  return (
    <div className={styles["radio-group"]}>
      <FieldGroup
        fieldGroupClassName="radio-field-group"
        fieldClassName="radio-field"
        type="radio"
        name={fieldNames?.question}
        groupLabel={label && t(label)}
        groupNote={note && t(note)}
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
    </div>
  )
}

export default YesNoRadio
