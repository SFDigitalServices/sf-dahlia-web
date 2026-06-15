import React from "react"
import { useFormContext } from "react-hook-form"
import { Field, Select, t } from "@bloom-housing/ui-components"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import PreferenceProofUploadField from "./PreferenceProofUploadField"
import { type PreferenceContent, type PreferenceFieldNames } from "./PreferenceUtils"
import {
  getProofOptions,
  allHouseholdMembers,
  generateHouseholdMemberOptions,
} from "../../../../util/listingApplyUtil"
import { getNestedError } from "../../../../util/formEngineUtil"
import { renderInlineMarkup } from "../../../../util/languageUtil"
import styles from "./ListingApplyPreferenceStepWrapper.module.scss"

interface PreferenceFieldsProps {
  preferenceContent: PreferenceContent
  preferenceFieldNames: PreferenceFieldNames
  listingPreferenceId: string
}

const PreferenceFields = ({
  listingPreferenceId,
  preferenceContent: {
    preferenceName,
    proofHouseholdMemberLabel,
    proofTypeLabel,
    proofTypeNote,
    proofTypeSingleValue,
    certificateNumberLabel,
    certificateNumberNote,
    proofUploadButtonLabel,
  },
  preferenceFieldNames: {
    householdMemberId,
    certificateNumber,
    proofType,
    proofFileName,
    proofFileUploadedAt,
  },
}: PreferenceFieldsProps) => {
  /* eslint-disable @typescript-eslint/unbound-method */
  const {
    register,
    formState: { errors },
  } = useFormContext()
  /* eslint-enable @typescript-eslint/unbound-method */
  const { sessionId, staticData, formData } = useFormEngineContext()
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  const listing = staticData.listing!

  // TODO: DAH-4161
  // look up eligibility of household members for particular preferences, like in `Service.eligibleMembers`
  const eligibleHouseholdMembers = allHouseholdMembers(formData)

  return (
    <>
      <Select
        id={householdMemberId}
        name={householdMemberId}
        label={t(proofHouseholdMemberLabel)}
        labelClassName={styles["preference-fields-label"]}
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
      {proofTypeLabel &&
        proofType &&
        proofFileName &&
        proofFileUploadedAt &&
        listingPreferenceId &&
        proofUploadButtonLabel && (
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
            proofUploadButtonLabel={t(proofUploadButtonLabel)}
          />
        )}
      {certificateNumberLabel && certificateNumber && (
        <Field
          name={certificateNumber}
          label={t(certificateNumberLabel)}
          labelClassName={styles["preference-fields-label"]}
          note={certificateNumberNote && <p>{renderInlineMarkup(t(certificateNumberNote))}</p>}
          placeholder={t("label.certificateNumber")}
          register={register}
        />
      )}
    </>
  )
}

export default PreferenceFields
