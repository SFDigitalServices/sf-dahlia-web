import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { FormErrorMessage } from "@bloom-housing/ui-seeds"
import { useFormContext } from "react-hook-form"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./VeteransPreferenceRadio.module.scss"
import Select from "../components/Select"
import { getFullName, parseDate } from "../../../util/formEngineUtil"
import { type HouseholdMember, validVeteranAge, allHouseholdMembers } from "../../../util/listingApplyUtil"

interface VeteransRadioProps {
  fieldNames: { isAnyoneAVeteran: string, veteranMemberId: string }
}

const VeteransPreferenceRadio = ({ fieldNames: { isAnyoneAVeteran, veteranMemberId } }: VeteransRadioProps) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext()

  const { formData } = useFormEngineContext()

  const isAnyoneAVeteranValue = watch(isAnyoneAVeteran)

  const validVeterans: HouseholdMember[] = allHouseholdMembers(formData).filter((hhMember) => {
    const birthDate = parseDate(hhMember.birthYear, hhMember.birthMonth, hhMember.birthDay)
    return validVeteranAge(birthDate)
  })

  const veteranOptions = () => {
    validVeterans.map((hhMember) => ({
      label: getFullName({ firstName: hhMember.firstName, middleName: hhMember.middleName, lastName: hhMember.lastName }),
      value: hhMember.id,
    }))
  }

  

  return (
    <div className={styles["radio-group"]}>
      <Field
        name={isAnyoneAVeteran}
        className={styles["radio-field"]}
        type="radio"
        id="yes"
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
          options={veteranOptions}
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
        id="no"
        label={t("t.no")}
        register={register}
        inputProps={{ value: "no" }}
        validation={{ required: true }}
      />

      <Field
        name={isAnyoneAVeteran}
        className={styles["radio-field"]}
        type="radio"
        id="preferNotToAnswer"
        label={t("t.preferNotToAnswer")}
        register={register}
        inputProps={{ value: "preferNotToAnswer" }}
        validation={{ required: true }}
      />

      {!!errors?.[isAnyoneAVeteran] && (
        <FormErrorMessage>{t("error.pleaseSelectAnOption")}</FormErrorMessage>
      )}
    </div>
  )
}

export default VeteransPreferenceRadio

