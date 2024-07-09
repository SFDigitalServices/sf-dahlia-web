import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { UseFormMethods, FieldError, DeepMap } from "react-hook-form"
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
}

const validateNumber = (required: boolean, value: string, maxValue: number) => {
  if (!required && !value?.length) return true

  return Number.parseInt(value) > 0 && Number.parseInt(value) <= maxValue
}

const DateField = ({
  fieldKey,
  defaultDOB,
  error,
  required,
  register,
}: {
  fieldKey: string
  defaultDOB: DOBFieldValues
  error: DeepMap<DOBFieldValues, FieldError>
  required: boolean
  register: UseFormMethods["register"]
}) => {
  const isMonthField = fieldKey === "birthMonth"

  return (
    <Field
      name={`dob.${fieldKey}`}
      label={isMonthField ? t("label.dobMonth") : t("label.dobDate")}
      defaultValue={defaultDOB?.[fieldKey] ?? ""}
      error={error?.[fieldKey] !== undefined}
      validation={{
        required: required,
        validate: {
          monthRange: (value: string) => {
            const maxNumber = isMonthField ? 12 : 31
            return validateNumber(required, value, maxNumber)
          },
        },
      }}
      inputProps={{ maxLength: 2 }}
      register={register}
    />
  )
}

const YearField = ({
  defaultDOB,
  error,
  required,
  watch,
  register,
}: {
  register: UseFormMethods["register"]
  watch: UseFormMethods["watch"]
  defaultDOB?: DOBFieldValues
  error?: boolean
  required?: boolean
}) => {
  const birthDay = watch("birthDay") ?? defaultDOB?.birthDay
  const birthMonth = watch("birthMonth") ?? defaultDOB?.birthMonth

  const validateAge = (value: string) => {
    return (
      dayjs(`${birthMonth}/${birthDay}/${value}`, "M/D/YYYY") < dayjs().subtract(18, "years") &&
      dayjs(`${birthMonth}/${birthDay}/${value}`, "M/D/YYYY") > dayjs().subtract(117, "years")
    )
  }

  return (
    <Field
      name="dob.birthYear"
      label={t("label.dobYear")}
      defaultValue={defaultDOB?.birthYear ?? ""}
      error={error}
      validation={{
        required: required,
        validate: {
          yearRange: (value: string) => {
            if (value?.length) return validateAge(value)
            return true
          },
        },
      }}
      inputProps={{ maxLength: 4 }}
      register={register}
    />
  )
}

const DOBFields = ({ register, watch, required, defaultDOB, error }: DOBFieldProps) => {
  return (
    <>
      <DateField
        fieldKey="birthMonth"
        defaultDOB={defaultDOB}
        error={error}
        register={register}
        required={required}
      />
      <DateField
        fieldKey="birthDay"
        defaultDOB={defaultDOB}
        error={error}
        register={register}
        required={required}
      />
      <YearField
        defaultDOB={defaultDOB}
        error={error?.birthYear !== undefined}
        register={register}
        watch={watch}
        required={required}
      />
    </>
  )
}

const DOBFieldset = ({ register, watch, defaultDOB, error, id, required }: DOBFieldProps) => {
  const hasError = error?.birthMonth || error?.birthDay || error?.birthYear

  return (
    <fieldset id={id}>
      <legend className={hasError ? "text-alert" : ""}>{t("label.dob")}</legend>

      <div className="field-note my-3">For example, November 23, 1975 is 11-23-1975</div>
      <div className="field-group--date">
        <DOBFields
          register={register}
          watch={watch}
          defaultDOB={defaultDOB}
          error={error}
          required={required}
        />
      </div>

      {hasError && (
        <div className="field error">
          <span className="error-message">{t("error.dob")}</span>
        </div>
      )}
    </fieldset>
  )
}

export default DOBFieldset
