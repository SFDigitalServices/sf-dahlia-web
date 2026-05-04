/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { FormErrorMessage } from "@bloom-housing/ui-seeds"
import { useFormContext } from "react-hook-form"
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./VeteransPreferenceRadio.module.scss"
import Select from "../components/Select"
import { getFullName, parseDate } from "../../../util/formEngineUtil"
import {
  type HouseholdMember,
  validVeteranAge,
  allHouseholdMembers,
} from "../../../util/listingApplyUtil"

interface VeteransPrefernceRadioProps {
  fieldNames: { isAnyoneAVeteran: string; veteranMemberId: string }
}

const VeteransPreferenceRadio = ({
  fieldNames: { isAnyoneAVeteran, veteranMemberId },
}: VeteransPrefernceRadioProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext()

  const { formData } = useFormEngineContext()

  const isAnyoneAVeteranValue = watch(isAnyoneAVeteran)

  const validVeterans: HouseholdMember[] = allHouseholdMembers(formData).filter((hhMember) => {
    const birthDate = parseDate(hhMember.birthYear, hhMember.birthMonth, hhMember.birthDay)
    return validVeteranAge(birthDate)
  })

  const veteranOptions = () =>
    validVeterans.map((hhMember) => ({
      label: getFullName({
        firstName: hhMember.firstName,
        middleName: hhMember.middleName,
        lastName: hhMember.lastName,
      }),
      value: hhMember.id,
    }))

  const handleNoOrPreferNotToAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) setValue(veteranMemberId, "")
  }

  return (
    <fieldset className={styles["veteran-preference-group"]}>
      <div className="radio-field-group">
        <Field
          name={isAnyoneAVeteran}
          className={styles["radio-field"]}
          type="radio"
          id="veteranYes"
          label={t("t.yes")}
          register={register}
          inputProps={{
            value: "yes",
          }}
          validation={{ required: true }}
        />
        {isAnyoneAVeteranValue === "yes" && (
          <Select
            fieldNames={{ selection: veteranMemberId }}
            label={"e7aVeteransPreference.whoIsAVeteran"}
            subNote={"e7aVeteransPreference.ifMoreThan1Veteran"}
            defaultOptionName={"label.selectOne"}
            options={veteranOptions()}
            validation={{
              required: true,
            }}
            errorMessage={"e7aVeteransPreference.selectWhichApplication"}
            doNotTranslateOptions
          />
        )}

        <Field
          name={isAnyoneAVeteran}
          className={styles["radio-field"]}
          type="radio"
          id="veteranNo"
          label={t("t.no")}
          register={register}
          inputProps={{ value: "no" }}
          validation={{ required: true }}
          onChange={handleNoOrPreferNotToAnswer}
        />

        <Field
          name={isAnyoneAVeteran}
          className={styles["radio-field"]}
          type="radio"
          id="veteranPreferNotToAnswer"
          label={t("t.preferNotToAnswer")}
          register={register}
          inputProps={{ value: "preferNotToAnswer" }}
          validation={{ required: true }}
          onChange={handleNoOrPreferNotToAnswer}
        />
        {isAnyoneAVeteranValue === "preferNotToAnswer" && (
          <div className="field-sub-note">
            <p>
              <FontAwesomeIcon icon={faCircleInfo} />{" "}
              <b>{t("e7aVeteransPreference.yourAnswerCouldAffectLotteryRanking")}</b>
            </p>
            <p>{t("e7aVeteransPreference.ifSomeoneOnTheApplicationIsAVeteran")}</p>
          </div>
        )}

        {!!errors?.[isAnyoneAVeteran] && (
          <FormErrorMessage>{t("error.pleaseSelectAnOption")}</FormErrorMessage>
        )}
      </div>
    </fieldset>
  )
}

export default VeteransPreferenceRadio
