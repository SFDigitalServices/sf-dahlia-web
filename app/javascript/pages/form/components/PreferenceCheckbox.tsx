import React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Field, Select, t } from "@bloom-housing/ui-components"
import { Link } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import {
  type PreferenceContent,
  type PreferenceFieldNames,
} from "./ListingApplyPreferenceStepWrapper"
import PreferenceProofUploadField from "./PreferenceProofUploadField"
import {
  getProofOptions,
  allHouseholdMembers,
  generateHouseholdMemberOptions,
} from "../../../util/listingApplyUtil"
import { getNestedError } from "../../../util/formEngineUtil"
import styles from "./PreferenceCheckbox.module.scss"

interface PreferenceCheckboxProps {
  showRequiredCheckboxError: boolean
  onPreferenceCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  preferenceContent: PreferenceContent
  preferenceFieldNames: PreferenceFieldNames
  listingPreferenceId: string
  readMoreUrl?: string
}

const PreferenceCheckbox = ({
  showRequiredCheckboxError,
  onPreferenceCheckboxChange,
  listingPreferenceId,
  readMoreUrl,
  preferenceContent: {
    preferenceName,
    checkboxLabel,
    checkboxDescription,
    proofHouseholdMemberLabel,
    proofTypeLabel,
    proofTypeNote,
    proofTypeSingleValue,
    certificateNumberLabel,
    certificateNumberNote,
    proofUploadButtonLabel,
  },
  preferenceFieldNames: {
    preferenceClaimed,
    householdMemberId,
    certificateNumber,
    proofType,
    proofFileName,
    proofFileUploadedAt,
  },
}: PreferenceCheckboxProps) => {
  /* eslint-disable-next-line @typescript-eslint/unbound-method */
  const { register, errors } = useFormContext()
  const { sessionId, staticData, formData } = useFormEngineContext()
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  const listing = staticData.listing!

  const eligibleHouseholdMembers = allHouseholdMembers(formData)

  const checkBoxValue = useWatch({
    name: preferenceClaimed,
  })

  return (
    <div className={styles["preference-section"]}>
      <Field
        type="checkbox"
        name={preferenceClaimed}
        label={t(checkboxLabel)}
        register={register}
        error={showRequiredCheckboxError}
        onChange={onPreferenceCheckboxChange}
        className={styles["preference-checkbox"]}
        labelClassName={styles["preference-checkbox-label"]}
      />
      <div className={styles["preference-content-wrapper"]}>
        <div className={styles["preference-note"]}>{t(checkboxDescription)}</div>
        {readMoreUrl && (
          <Link
            href={readMoreUrl}
            hideExternalLinkIcon
            newWindowTarget
            className={styles["read-more-url"]}
          >
            {t("label.findOutMoreAboutPreferences")}
          </Link>
        )}
        {!!checkBoxValue && (
          <Select
            id={householdMemberId}
            name={householdMemberId}
            label={t(proofHouseholdMemberLabel || "label.applicantPreferencesDocumentName")}
            options={generateHouseholdMemberOptions(eligibleHouseholdMembers)}
            placeholder={t("label.selectOne")}
            controlClassName="control"
            register={register}
            error={!!getNestedError(errors, householdMemberId)}
            errorMessage={t("error.pleaseSelectAnOption")}
            validation={{
              required: true,
            }}
          />
        )}
        {!!checkBoxValue &&
          proofTypeLabel &&
          proofType &&
          proofFileName &&
          proofFileUploadedAt &&
          listingPreferenceId && (
            <PreferenceProofUploadField
              sessionId={sessionId}
              listingId={listing.Id}
              listingPreferenceId={listingPreferenceId}
              proofTypeFieldName={proofType}
              proofTypeLabel={t(proofTypeLabel)}
              proofTypeNote={proofTypeNote && t(proofTypeNote)}
              proofTypeOptions={getProofOptions(preferenceName)}
              proofTypeSingleValue={proofTypeSingleValue}
              proofFileName={proofFileName}
              proofFileUploadedAt={proofFileUploadedAt}
              proofUploadButtonLabel={proofUploadButtonLabel && t(proofUploadButtonLabel)}
            />
          )}
        {!!checkBoxValue && certificateNumberLabel && certificateNumber && (
          <Field
            name={certificateNumber}
            label={certificateNumberLabel && t(certificateNumberLabel)}
            note={certificateNumberNote && t(certificateNumberNote)}
            placeholder={t("label.certificateNumber")}
            register={register}
          />
        )}
      </div>
    </div>
  )
}

export default PreferenceCheckbox
