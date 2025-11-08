import React from "react"
import { Select, t } from "@bloom-housing/ui-components"
import LiveWorkPreferenceFields from "./LiveWorkPreferenceFields"
import { useFormContext } from "react-hook-form"

interface LiveOrWorkComboPreferenceFieldsProps {
  liveOrWorkInSf: string
  liveOrWorkInSfClaimedOption: string
  liveInSfMember: string
  liveInSfProofType: string
  liveInSfFileName: string
  liveInSfFileUploadedAt: string
  workInSfMember: string
  workInSfProofType: string
  workInSfFileName: string
  workInSfFileUploadedAt: string
}

const LiveOrWorkComboPreferenceFields = ({
  liveOrWorkInSfClaimedOption,
  liveInSfMember,
  liveInSfProofType,
  liveInSfFileName,
  liveInSfFileUploadedAt,
  workInSfMember,
  workInSfProofType,
  workInSfFileName,
  workInSfFileUploadedAt,
}: LiveOrWorkComboPreferenceFieldsProps) => {
  const { register, watch, errors } = useFormContext()
  const liveOrWorkInSfClaimedOptionValue = watch(liveOrWorkInSfClaimedOption)
  const options = [
    { label: t("e2cLiveWorkPreference.liveWorkSfPreference.liveSfPreference"), value: "liveInSf" },
    { label: t("e2cLiveWorkPreference.liveWorkSfPreference.workSfPreference"), value: "workInSf" },
  ]

  return (
    <>
      <Select
        id={liveOrWorkInSfClaimedOption}
        name={liveOrWorkInSfClaimedOption}
        label={t("label.preferenceOptionToClaim")}
        options={options}
        placeholder={t("label.selectOne")}
        controlClassName="control"
        register={register}
        error={!!errors?.[liveOrWorkInSfClaimedOption]}
        errorMessage={t("error.pleaseSelectAnOption")}
        validation={{
          required: true,
        }}
      />
      {liveOrWorkInSfClaimedOptionValue == "liveInSf" && (
        <LiveWorkPreferenceFields
          householdMemberFieldName={liveInSfMember}
          proofTypeFieldName={liveInSfProofType}
          proofTypeLabel={t("label.preferenceProofAddressDocuments")}
          proofTypeNote={t("e2cLiveWorkPreference.documentMustShowCorrectName")}
          proofFileName={liveInSfFileName}
          proofFileUploadedAt={liveInSfFileUploadedAt}
        />
      )}
      {liveOrWorkInSfClaimedOptionValue == "workInSf" && (
        <LiveWorkPreferenceFields
          householdMemberFieldName={workInSfMember}
          proofTypeFieldName={workInSfProofType}
          proofTypeLabel={t("label.preferenceProofDocuments")}
          proofTypeNote={t("e2cLiveWorkPreference.documentMustShowCorrectNameForWork")}
          proofFileName={workInSfFileName}
          proofFileUploadedAt={workInSfFileUploadedAt}
        />
      )}
    </>
  )
}

export default LiveOrWorkComboPreferenceFields
