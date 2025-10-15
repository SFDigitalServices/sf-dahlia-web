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
  ageErrorMessage: string
  fieldNames: {
    birthMonth: string
    birthDay: string
    birthYear: string
  }
  minimumAge?: number
}

const DateOfBirth = ({
  label,
  ageErrorMessage,
  fieldNames: { birthMonth, birthDay, birthYear },
  minimumAge,
}: DateOfBirthProps) => {
  const { register, errors, watch, trigger } = useFormStepContext()
  const {
    dataSources: { seniorBuildingAgeRequirement },
  } = useFormEngineContext()

  const VALID_AGE = "validAge"
  const hasError = !!errors?.[birthMonth] || !!errors?.[birthDay] || !!errors?.[birthYear]
  const ageError = errors?.[birthYear]?.type === VALID_AGE
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
              [VALID_AGE]: () => validAge(birthDate(), minimumAge, seniorBuildingAgeRequirement),
            },
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={triggerValidation}
        />
      </fieldset>
      {hasError && !ageError && (
        <div className="field error">
          <span className="error-message">{t("error.dob")}</span>
        </div>
      )}
      {hasError && ageError && (
        <div className="field error">
          <span className="error-message">{t(ageErrorMessage)}</span>
        </div>
      )}
    </>
  )
}

export default DateOfBirth
