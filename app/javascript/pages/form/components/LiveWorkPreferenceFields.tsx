import React from "react"
import { useFormContext } from "react-hook-form"
import { t, Select } from "@bloom-housing/ui-components"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import PreferenceProofUploadField from "./PreferenceUploadField"
import { PREFERENCES, PROOF_OPTIONS } from "../../../modules/constants"
import styles from "./ListingApplyLiveWorkPreference.module.scss"

interface LiveWorkPreferenceFieldsProps {
  householdMemberFieldName: string
  proofTypeFieldName: string
  proofDocFieldName: string
  proofTypeLabel: string
  proofTypeNote: string
}

const LiveWorkPreferenceFields = ({
  householdMemberFieldName,
  proofTypeFieldName,
  proofDocFieldName,
  proofTypeLabel,
  proofTypeNote,
}: LiveWorkPreferenceFieldsProps) => {
  const { sessionId, listing, preferences } = useFormEngineContext()

  const { register, errors } = useFormContext()

  const listingPreferenceId = preferences.find(
    (pref) => pref.preferenceName === PREFERENCES.liveWorkInSf
  ).listingPreferenceID

  return (
    <>
      <Select
        id={householdMemberFieldName}
        name={householdMemberFieldName}
        label={t("label.applicantPreferencesDocumentName")}
        options={[{ label: "test", value: "test" }]}
        placeholder={t("label.selectOne")}
        controlClassName="control"
        register={register}
        error={!!errors?.[householdMemberFieldName]}
        errorMessage={t("error.pleaseSelectAnOption")}
        validation={{
          required: true,
        }}
      />
      <PreferenceProofUploadField
        sessionId={sessionId}
        proofTypeFieldName={proofTypeFieldName}
        proofTypeLabel={proofTypeLabel}
        proofTypeNote={proofTypeNote}
        proofTypeOptions={PROOF_OPTIONS.liveInSf}
        proofDocFieldName={proofDocFieldName}
        listingId={listing.Id}
        listingPreferenceId={listingPreferenceId}
      />
    </>
  )
}

export default LiveWorkPreferenceFields
