import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import {
  validDayRange,
  validMonthRange,
  validYearRange,
  parseDate,
} from "../../../util/formEngineUtil"
import dayjs from "dayjs"
import "./DateOfBirth.scss"

interface DateOfBirthProps {
  label: string
  fieldNames: {
    birthMonth: string
    birthDay: string
    birthYear: string
  }
  minimumAge?: number
}

const DateOfBirth = ({
  label,
  fieldNames: { birthMonth, birthDay, birthYear },
  minimumAge,
}: DateOfBirthProps) => {
  const { register, errors, watch, trigger } = useFormStepContext()
  const {
    dataSources: { seniorBuildingAgeRequirement },
  } = useFormEngineContext()

  const hasError = !!errors?.[birthMonth] || !!errors?.[birthDay] || !!errors?.[birthYear]
  const birthDayValue = watch(birthDay)
  const birthMonthValue = watch(birthMonth)
  const birthYearValue = watch(birthYear)

  // handle leap years and months with less than 31 days
  const validDate = () => {
    if (!birthDayValue || !birthMonthValue || !birthYearValue) return true
    return parseDate(birthYearValue, birthMonthValue, birthDayValue).isValid()
  }

  const validAge = () => {
    const birthDate = parseDate(birthYearValue, birthMonthValue, birthDayValue)
    if (seniorBuildingAgeRequirement?.entireHousehold) {
      return dayjs().diff(birthDate, "year") >= seniorBuildingAgeRequirement.minimumAge
    }
    if (minimumAge) {
      return dayjs().diff(birthDate, "year") >= minimumAge
    }
    // "unborn baby" rule
    return dayjs().diff(birthDate, "month") > -10
  }

  const triggerValidation = async () => {
    !!birthDayValue && (await trigger(birthDay))
    !!birthYearValue && (await trigger(birthYear))
  }

  const labelClasses = ["field-group-title"]
  if (hasError) labelClasses.push("text-alert")

  return (
    <>
      <fieldset className="field-group-date">
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
              validMonthRange,
            },
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={triggerValidation}
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
              validDayRange,
              validDate,
            },
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={triggerValidation}
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
              validYearRange,
              validAge,
            },
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={triggerValidation}
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
