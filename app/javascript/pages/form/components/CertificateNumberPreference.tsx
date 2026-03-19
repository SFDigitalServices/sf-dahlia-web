/* eslint-disable @typescript-eslint/unbound-method */
import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { useFormContext } from "react-hook-form"
import { Link } from "@bloom-housing/ui-seeds"
import Select from "./Select"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { getPrimaryApplicantData } from "../../../util/formEngineUtil"
import { getSfGovUrl, renderInlineMarkup } from "../../../util/languageUtil"
import styles from "./CertificateNumberPreference.module.scss"

interface CertificateNumberPreferenceProps {
  name: string
  description: string
  readMoreUrl: string
  numberName: string
  numberDescription: string
  showDescription?: boolean
  fieldNames: {
    checkbox: string
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
  showDescription = false,
  fieldNames: { checkbox, copMember, copNumber, dthpMember, dthpNumber },
}: CertificateNumberPreferenceProps) => {
  const { register, watch } = useFormContext()
  const { formData } = useFormEngineContext()
  const checkboxValue = watch(checkbox, false)
  const currentPreference = copMember || dthpMember
  const currentPreferenceNumber = copNumber || dthpNumber
  const primaryApplicant = getPrimaryApplicantData(formData)
  // TODO: Need to grab household info from householdMembersArray datakey
  const householdMember = {
    firstName: formData.householdMemberFirstName as string,
    lastName: formData.householdMemberLastName as string,
  }
  const showAllHouseholdMembers = [
    {
      name: `${primaryApplicant.firstName} ${primaryApplicant.lastName}`,
      // TODO: Update submitted data values after DAH-3681 and DAH-3677
      value: `${primaryApplicant.firstName} ${primaryApplicant.lastName}`,
    },
    {
      name: `${householdMember.firstName} ${householdMember.lastName}`,
      value: `${householdMember.firstName} ${householdMember.lastName}`,
    },
  ]

  return (
    <div>
      {showDescription && <div className="field-note">{t("label.pleaseSelectPreference")}</div>}
      <Field
        type="checkbox"
        name={checkbox}
        register={register}
        label={t(name)}
        className={styles["certificate-preference-checkbox"]}
        labelClassName={styles["certificate-preference-checkbox"]}
      />

      <div className={styles["certificate-preference-container"]}>
        <div className="field-note">{t(description)}</div>
        <Link
          href={getSfGovUrl(readMoreUrl)}
          hideExternalLinkIcon
          newWindowTarget
          className={styles["certificate-preference-link"]}
        >
          {t("label.findOutMoreAboutPreferences")}
        </Link>

        {checkboxValue && (
          <div className={styles["certificate-preference-dropdown"]}>
            <Select
              options={showAllHouseholdMembers}
              fieldName={currentPreference}
              defaultOptionName={t("label.selectOne")}
              label={t("label.applicantPreferencesHouseholdMember")}
              labelClassName="text-base"
              errorMessage={t("error.pleaseSelectAnOption")}
              validation={{
                required: checkboxValue,
              }}
            />
            <div className={styles["number-name"]}>{t(numberName)}</div>
            <div className="field-note">{renderInlineMarkup(t(numberDescription))}</div>
            <Field
              name={currentPreferenceNumber}
              placeholder={t("label.certificateNumber")}
              register={register}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CertificateNumberPreference
