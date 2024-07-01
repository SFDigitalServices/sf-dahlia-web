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
  id?: string
  name?: string
  required?: boolean
}

const DOBFieldset = ({ register, watch, defaultDOB, error, id, name, required }: DOBFieldProps) => {
  const getFieldName = (baseName: string) => {
    // Append overall date field name to individual date field name
    return [name, baseName].filter((item) => item).join(".")
  }

  const hasError = error?.birthMonth || error?.birthDay || error?.birthYear

  const birthDay = watch(getFieldName("birthDay")) ?? defaultDOB?.birthDay
  const birthMonth = watch(getFieldName("birthMonth")) ?? defaultDOB?.birthMonth

  const validateAge = (value: string) => {
    return (
      dayjs(`${birthMonth}/${birthDay}/${value}`, "M/D/YYYY") < dayjs().subtract(18, "years") &&
      dayjs(`${birthMonth}/${birthDay}/${value}`, "M/D/YYYY") > dayjs().subtract(117, "years")
    )
  }

  const labelClasses = []
  if (hasError) labelClasses.push("text-alert")

  return (
    <fieldset id={id}>
      <legend className={labelClasses.join(" ")}>{t("label.dob")}</legend>

      <div className="field-note my-3">For example, November 23, 1975 is 11-23-1975</div>
      <div className="field-group--date">
        <Field
          name={getFieldName("birthMonth")}
          label={t("label.dobDate")}
          defaultValue={defaultDOB?.birthMonth ? defaultDOB.birthMonth : ""}
          error={error?.birthMonth !== undefined}
          validation={{
            required: required,
            validate: {
              monthRange: (value: string) => {
                if (!required && !value?.length) return true

                return Number.parseInt(value) > 0 && Number.parseInt(value) <= 12
              },
            },
          }}
          inputProps={{ maxLength: 2 }}
          register={register}
        />
        <Field
          name={getFieldName("birthDay")}
          label={t("label.dobMonth")}
          defaultValue={defaultDOB?.birthDay ? defaultDOB.birthDay : ""}
          error={error?.birthDay !== undefined}
          validation={{
            required: required,
            validate: {
              dayRange: (value: string) => {
                if (!required && !value?.length) return true

                return Number.parseInt(value) > 0 && Number.parseInt(value) <= 31
              },
            },
          }}
          inputProps={{ maxLength: 2 }}
          register={register}
        />
        <Field
          name={getFieldName("birthYear")}
          label={t("label.dobYear")}
          defaultValue={defaultDOB?.birthYear ? defaultDOB.birthYear : ""}
          error={error?.birthYear !== undefined}
          validation={{
            required: required,
            validate: {
              yearRange: (value: string) => {
                if (required && value && Number.parseInt(value) < 1900) return false
                if (required && value && Number.parseInt(value) > dayjs().year() + 10) return false
                if (!required && !value?.length) return true
                if (value?.length) return validateAge(value)
                return true
              },
            },
          }}
          inputProps={{ maxLength: 4 }}
          register={register}
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
