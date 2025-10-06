import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import {
  validDayRange,
  validMonthRange,
  validYearRange,
  validDate,
  validAge,
  parseDate,
} from "../../../util/formEngineUtil"
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
  const birthDayValue: string = watch(birthDay)
  const birthMonthValue: string = watch(birthMonth)
  const birthYearValue: string = watch(birthYear)
  const birthDate = () => parseDate(birthYearValue, birthMonthValue, birthDayValue)

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
              validDate: () => validDate(birthYearValue, birthMonthValue, birthDayValue),
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
              validAge: () => validAge(birthDate(), minimumAge, seniorBuildingAgeRequirement),
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
