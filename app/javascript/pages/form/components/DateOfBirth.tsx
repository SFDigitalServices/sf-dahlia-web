import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import "./DateOfBirth.scss"
interface DateOfBirthProps {
  label: string
  fieldNames: {
    birthMonth: string
    birthDay: string
    birthYear: string
  }
}

const DateOfBirth = ({
  label,
  fieldNames: { birthMonth, birthDay, birthYear },
}: DateOfBirthProps) => {
  const { register, errors, watch, trigger } = useFormStepContext()
  const hasError = !!errors?.[birthMonth] || !!errors?.[birthDay] || !!errors?.[birthYear]
  const birthDayValue = watch(birthDay)
  const birthMonthValue = watch(birthMonth)
  const birthYearValue = watch(birthYear)
  const currentYear = dayjs().year()

  // TODO: validate min age for 18 years, ~60 years, -10 months

  // handle leap years and months with less than 31 days
  const validDate = () => {
    if (!birthDayValue || !birthMonthValue || !birthYearValue) return true
    dayjs.extend(customParseFormat)
    return dayjs(
      `${birthYearValue}-${birthMonthValue.padStart(2, "0")}-${birthDayValue.padStart(2, "0")}`,
      "YYYY-MM-DD",
      true
    ).isValid()
  }

  const triggerDayValidation = async () => {
    !!birthDayValue && (await trigger(birthDay))
  }

  const labelClasses = ["field-group--title"]
  if (hasError) labelClasses.push("text-alert")

  return (
    <>
      <fieldset className="field-group--date">
        <legend className={labelClasses.join(" ")}>{t(label)}</legend>
        <Field
          label={t("label.dobMonth")}
          name={birthMonth}
          register={register}
          inputProps={{ maxLength: 2 }}
          error={!!errors?.[birthMonth]}
          validation={{
            required: true,
            validate: {
              monthRange: (value: string) =>
                Number.parseInt(value, 10) > 0 && Number.parseInt(value, 10) <= 12,
            },
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={triggerDayValidation}
        />
        <Field
          label={t("label.dobDay")}
          name={birthDay}
          register={register}
          inputProps={{ maxLength: 2 }}
          error={!!errors?.[birthDay]}
          validation={{
            required: true,
            validate: {
              dayRange: (value: string) =>
                Number.parseInt(value, 10) > 0 && Number.parseInt(value, 10) <= 31,
              dayValidity: validDate,
            },
          }}
        />
        <Field
          label={t("label.dobYear")}
          name={birthYear}
          register={register}
          inputProps={{ maxLength: 4 }}
          error={!!errors?.[birthYear]}
          validation={{
            required: true,
            validate: {
              yearRange: (value: string) =>
                Number.parseInt(value, 10) > 1900 && Number.parseInt(value, 10) <= currentYear,
            },
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={triggerDayValidation}
        />
      </fieldset>
      {hasError && (
        <div className="field error">
          <span className="error-message">{t("error.dob")}</span>
        </div>
      )}
    </>
  )
}

export default DateOfBirth
