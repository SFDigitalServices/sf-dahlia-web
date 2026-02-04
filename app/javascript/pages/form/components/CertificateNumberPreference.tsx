/* eslint-disable @typescript-eslint/unbound-method */
import { Field, t } from "@bloom-housing/ui-components"
import React, { useState } from "react"
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
  fieldNames: { copMember, copNumber, dthpMember, dthpNumber },
}: CertificateNumberPreferenceProps) => {
  const { register } = useFormContext()
  const { formData } = useFormEngineContext()
  const [isChecked, setIsChecked] = useState(false)
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
        name={`${currentPreference}_checkbox`}
        label={t(name)}
        onChange={(e) => setIsChecked(e.target.checked)}
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

        {isChecked && (
          <div className={styles["certificate-preference-dropdown"]}>
            <Select
              options={showAllHouseholdMembers}
              fieldNames={{ selection: currentPreference }}
              defaultOptionName={"label.selectOne"}
              label={"label.applicantPreferencesHouseholdMember"}
              labelClassName="text-base"
              errorMessage={"error.pleaseSelectAnOption"}
              validation={{
                required: isChecked,
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
