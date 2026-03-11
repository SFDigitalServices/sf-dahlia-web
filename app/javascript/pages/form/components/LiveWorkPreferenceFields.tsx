import React from "react"
import { useFormContext } from "react-hook-form"
import { t, Select } from "@bloom-housing/ui-components"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import PreferenceProofUploadField from "./PreferenceProofUploadField"
import { PREFERENCES } from "../../../modules/constants"

interface LiveWorkPreferenceFieldsProps {
  householdMemberFieldName: string
  proofTypeFieldName: string
  proofTypeLabel: string
  proofTypeNote: string
  proofFileName: string
  proofFileUploadedAt: string
  proofTypeOptions: { value: string; label: string }[]
}

const LiveWorkPreferenceFields = ({
  householdMemberFieldName,
  proofTypeFieldName,
  proofTypeLabel,
  proofTypeNote,
  proofFileName,
  proofFileUploadedAt,
  proofTypeOptions,
}: LiveWorkPreferenceFieldsProps) => {
  const { sessionId, listing, preferences } = useFormEngineContext()

  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors } = useFormContext()

  const listingPreferenceId = preferences.find(
    (pref) => pref.preferenceName === PREFERENCES.liveWorkInSf
  )?.listingPreferenceID

  return (
    <>
      <Select
        id={householdMemberFieldName}
        name={householdMemberFieldName}
        label={t("label.applicantPreferencesDocumentName")}
        options={[{ label: "test", value: "test" }]} // TODO: populate with real household member data
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
        proofTypeOptions={proofTypeOptions}
        listingId={listing.Id}
        listingPreferenceId={listingPreferenceId}
        proofFileName={proofFileName}
        proofFileUploadedAt={proofFileUploadedAt}
      />
    </>
  )
}

export default LiveWorkPreferenceFields
