/* eslint-disable @typescript-eslint/unbound-method */
import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { useFormContext } from "react-hook-form"
import styles from "./PrioritiesCheckbox.module.scss"
import { Link } from "@bloom-housing/ui-seeds"
import Select from "./Select"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { getPrimaryApplicantData } from "../../../util/formEngineUtil"
import { getSfGovUrl, renderInlineMarkup } from "../../../util/languageUtil"

interface CertificateNumberPreferenceProps {
  name: string
  description: string
  readMoreUrl: string
  numberName: string
  numberDescription: string
  fieldNames: {
    copMember?: string
    copNumber?: string
    dthpMember?: string
    dthpNumber?: string
  }
}

const CertificateNumberPreference = ({
  name,
  description,
  readMoreUrl,
  numberDescription,
  numberName,
  fieldNames: { copMember, copNumber, dthpMember, dthpNumber },
}: CertificateNumberPreferenceProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const currentPreference = copMember ?? dthpMember
  const currentNumber = copNumber ?? dthpNumber

  const { formData } = useFormEngineContext()
  const primaryApplicant = getPrimaryApplicantData(formData)
  //    Need to grab this from householdMembersArray
  const householdMember = {
    firstName: formData.householdMemberFirstName as string,
    lastName: formData.householdMemberLastName as string,
  }
  const allHouseholdMembers = [
    {
      name: `${primaryApplicant.firstName} ${primaryApplicant.lastName}`,
      value: `${primaryApplicant.firstName} ${primaryApplicant.lastName}`,
    },
    {
      name: `${householdMember.firstName} ${householdMember.lastName}`,
      value: `${householdMember.firstName} ${householdMember.lastName}`,
    },
  ]

  //   If checked, set copMember or DTHP member to True
  //  Show copMember or dthp member dropdown
  // set copMember or dthp Member value using register
  // show certificate number dropdown
  // set number to copNumber
  return (
    <div className={styles["listing-priorities-checkbox-group"]}>
      <Field
        name={currentPreference}
        type="checkbox"
        label={t(name)}
        // fieldGroupClassName="radio-field-group"
        register={register}
        error={!!errors?.[copMember || dthpMember]}
        errorMessage={t("error.pleaseSelectAnOption")}
        validation={{
          required: true,
        }}
      />

      <div>{t(description)}</div>

      <Link href={getSfGovUrl(readMoreUrl)} hideExternalLinkIcon newWindowTarget>
        {t("label.findOutMoreAboutPreferences")}
      </Link>

      <Select
        label={"label.applicantPreferencesHouseholdMember"}
        // validation={{
        //   required: requireAddress,
        //   maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.address,
        // }}
        // error={!!errors?.[addressState]}
        fieldNames={{ selection: copMember }}
        options={allHouseholdMembers}
        errorMessage={t("error.state")}
        defaultOptionName={t("label.selectOne")}
      />
      <div>{t(numberName)}</div>
      <div>{renderInlineMarkup(t(numberDescription))}</div>
      <Field
        name={currentNumber}
        placeholder={t("label.certificateNumber")}
        validation={{
          //   required: requireAddress,
          pattern: {
            value: /^\d{5}(-\d{4})?$/,
            message: t("error.zip"),
          },
        }}
        errorMessage={t("error.zip")}
        // error={!!errors?.[mailingAddressZipcode]}
        register={register}
      />
      {/* checkbox */}
    </div>
  )
}

export default CertificateNumberPreference
