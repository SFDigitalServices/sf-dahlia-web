import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { UseFormMethods, FieldError, DeepMap } from "react-hook-form"
import Fieldset from "./Fieldset"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { ErrorMessages } from "./ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage, SetErrorArgs } from "./util"
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
  note?: React.ReactNode
}

export const deduplicateDOBErrors = (
  errors: DeepMap<DOBFieldValues, FieldError>
): DeepMap<DOBFieldValues, FieldError> => {
  const messageMap = Object.entries(errors).reduce((acc, [key, error]) => {
    if (error && error.message) {
      acc[error.message] = acc[error.message] || []
      acc[error.message].push(key)
    }
    return acc
  }, {} as { [message: string]: string[] })

  const consolidatedErrors = Object.entries(messageMap).reduce((acc, [message, keys]) => {
    const consolidatedKey = keys[0] as keyof DOBFieldValues
    acc[consolidatedKey] = {
      message,
      ref: errors[consolidatedKey]?.ref,
      type: errors[consolidatedKey]?.type || "required",
    } as FieldError
    return acc
  }, {} as DeepMap<DOBFieldValues, FieldError>)

  return consolidatedErrors
}

export const handleDOBServerErrors = (error: ExpandedAccountAxiosError): SetErrorArgs => {
  return error.response.status === 422
    ? [
        "dobObject.birthYear",
        {
          message: "dob:invalid",
          shouldFocus: true,
          type: "range",
        },
      ]
    : ["dobObject.birthYear", { message: "dob:server:generic", shouldFocus: true }]
}

export const dobFieldsetErrors: ErrorMessages = {
  "dob:invalid": {
    default: "error.account.dob",
    abbreviated: "error.account.dob.abbreviated",
  },
  "dob:missing": {
    default: "error.account.dobMissing",
    abbreviated: "error.account.dobMissing.abbreviated",
  },
  "dob:age": {
    default: "error.account.dobTooYoung",
    abbreviated: "error.account.dobTooYoung.abbreviated",
  },
  "dob:server:generic": {
    default: "error.account.genericServerError",
    abbreviated: "error.account.genericServerError.abbreviated",
  },
}

const validateNumber = (required: boolean, value: string, maxValue: number, errorKey: string) => {
  if (!required && !value?.length) return true

  return Number.parseInt(value) > 0 && Number.parseInt(value) <= maxValue ? true : errorKey
}

const validateAge = (month: string, day: string, year: string) => {
  if (year.length < 4) return "dob:invalid"
  if (dayjs(`${month}/${day}/${year}`, "M/D/YYYY").valueOf() > dayjs().valueOf())
    return "dob:invalid"
  if (
    dayjs(`${month}/${day}/${year}`, "M/D/YYYY").valueOf() <
    dayjs().subtract(117, "years").valueOf()
  )
    return "dob:invalid"
  if (
    dayjs(`${month}/${day}/${year}`, "M/D/YYYY").valueOf() > dayjs().subtract(18, "years").valueOf()
  )
    return "dob:age"
  return true
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
  required?: boolean
  register: UseFormMethods["register"]
  watch: UseFormMethods["watch"]
  onChange: () => void
}) => {
  const birthDay: string = watch("dobObject.birthDay") ?? defaultDOB?.birthDay
  const birthMonth: string = watch("dobObject.birthMonth") ?? defaultDOB?.birthMonth

  const fieldInfo = {
    birthDay: {
      label: t("label.dobDay"),
      validation: (value: string) => {
        return validateNumber(required, value, 31, "dob:invalid")
      },
      required: required ? "dob:missing" : undefined,
      maxLength: 2,
    },
    birthMonth: {
      label: t("label.dobMonth"),
      validation: (value: string) => {
        return validateNumber(required, value, 12, "dob:invalid")
      },
      required: required ? "dob:missing" : undefined,
      maxLength: 2,
    },
    birthYear: {
      label: t("label.dobYear"),
      validation: (value: string) => {
        if (value?.length) return validateAge(birthDay, birthMonth, value)
        return true
      },
      required: required ? "dob:missing" : undefined,
      maxLength: 4,
    },
  }

  return (
    <Field
      className="ml-0 mr-4 pb-4"
      name={`dobObject.${fieldKey}`}
      label={fieldInfo[fieldKey].label}
      defaultValue={defaultDOB?.[fieldKey] ?? ""}
      error={error?.[fieldKey] !== undefined}
      validation={{
        required: fieldInfo[fieldKey].required,
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
  const fieldKeys = ["birthMonth", "birthDay", "birthYear"]
  return (
    <>
      {fieldKeys.map((key, index) => (
        <DateField
          key={index}
          fieldKey={key}
          defaultDOB={defaultDOB}
          error={error}
          register={register}
          watch={watch}
          required={required}
          onChange={onChange}
        />
      ))}
    </>
  )
}

const DOBFieldset = ({
  register,
  watch,
  defaultDOB,
  error,
  required,
  onChange,
  note,
}: DOBFieldProps) => {
  const hasError = !!error?.birthMonth || !!error?.birthDay || !!error?.birthYear

  const determineErrorLanguage = () => {
    if (error?.birthYear) {
      return getErrorMessage(error?.birthYear?.message, dobFieldsetErrors, false)
    } else if (error?.birthMonth) {
      return getErrorMessage(error?.birthMonth?.message, dobFieldsetErrors, false)
    } else {
      return getErrorMessage(error?.birthDay?.message, dobFieldsetErrors, false)
    }
  }

  return (
    <Fieldset hasError={hasError} label={t("label.dob.sentenceCase")} note={note}>
      <div className="field-group--date mt-1">
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
          <span className="error-message">{renderInlineMarkup(determineErrorLanguage())}</span>
        </div>
      )}
    </Fieldset>
  )
}

export default DOBFieldset
