import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { UseFormMethods, FieldError, DeepMap } from "react-hook-form"
import Fieldset from "./Fieldset"
dayjs.extend(customParseFormat)

export type DOBFieldValues = {
  birthDay: string
  birthMonth: string
  birthYear: string
}

export interface DOBFieldProps {
  register: UseFormMethods["register"]
  watch: UseFormMethods["watch"]
  defaultDOB?: DOBFieldValues
  error?: DeepMap<DOBFieldValues, FieldError>
  required?: boolean
  id?: string
  onChange?: () => void
}

const validateNumber = (required: boolean, value: string, maxValue: number) => {
  if (!required && !value?.length) return true

  return Number.parseInt(value) > 0 && Number.parseInt(value) <= maxValue
}

const validateAge = (month: string, day: string, year: string) => {
  return (
    dayjs(`${month}/${day}/${year}`, "M/D/YYYY") < dayjs().subtract(18, "years") &&
    dayjs(`${month}/${day}/${year}`, "M/D/YYYY") > dayjs().subtract(117, "years")
  )
}

const DateField = ({
  fieldKey,
  defaultDOB,
  error,
  required,
  register,
  watch,
  onChange,
}: {
  fieldKey: string
  defaultDOB: DOBFieldValues
  error: DeepMap<DOBFieldValues, FieldError>
  required: boolean
  register: UseFormMethods["register"]
  watch: UseFormMethods["watch"]
  onChange: () => void
}) => {
  const birthDay: string = watch("birthDay") ?? defaultDOB?.birthDay
  const birthMonth: string = watch("birthMonth") ?? defaultDOB?.birthMonth

  const fieldInfo = {
    birthDay: {
      label: t("label.dobDay"),
      validation: (value: string) => {
        return validateNumber(required, value, 31)
      },
      maxLength: 2,
    },
    birthMonth: {
      label: t("label.dobMonth"),
      validation: (value: string) => {
        return validateNumber(required, value, 12)
      },
      maxLength: 2,
    },
    birthYear: {
      label: t("label.dobYear"),
      validation: (value: string) => {
        if (value?.length) return validateAge(birthDay, birthMonth, value)
        return true
      },
      maxLength: 4,
    },
  }

  return (
    <Field
      className="ml-0 mr-4 pb-4"
      name={`dob.${fieldKey}`}
      label={fieldInfo[fieldKey].label}
      defaultValue={defaultDOB?.[fieldKey] ?? ""}
      error={error?.[fieldKey] !== undefined}
      validation={{
        required: required,
        validate: {
          range: fieldInfo[fieldKey].validation,
        },
      }}
      inputProps={{ maxLength: fieldInfo[fieldKey].maxLength }}
      register={register}
      onChange={onChange}
    />
  )
}

const DOBFields = ({ register, watch, required, defaultDOB, error, onChange }: DOBFieldProps) => {
  return (
    <>
      <DateField
        fieldKey="birthMonth"
        defaultDOB={defaultDOB}
        error={error}
        register={register}
        watch={watch}
        required={required}
        onChange={onChange}
      />
      <DateField
        fieldKey="birthDay"
        defaultDOB={defaultDOB}
        error={error}
        register={register}
        watch={watch}
        required={required}
        onChange={onChange}
      />
      <DateField
        fieldKey="birthYear"
        defaultDOB={defaultDOB}
        error={error}
        register={register}
        watch={watch}
        required={required}
        onChange={onChange}
      />
    </>
  )
}

const DOBFieldset = ({ register, watch, defaultDOB, error, required, onChange }: DOBFieldProps) => {
  const hasError = !!error?.birthMonth || !!error?.birthDay || !!error?.birthYear

  return (
    <Fieldset hasError={hasError} label={t("label.dob.sentenceCase")}>
      <div className="field-group--date">
        <DOBFields
          register={register}
          watch={watch}
          defaultDOB={defaultDOB}
          error={error}
          required={required}
          onChange={onChange}
        />
      </div>

      {hasError && (
        <div className="field error">
          <span className="error-message">{t("error.dob")}</span>
        </div>
      )}
    </Fieldset>
  )
}

export default DOBFieldset
