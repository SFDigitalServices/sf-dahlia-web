import React from "react"
import { Select, t } from "@bloom-housing/ui-components"
import LiveWorkPreferenceFields from "./LiveWorkPreferenceFields"
import { useFormContext } from "react-hook-form"
import { PROOF_OPTIONS } from "../../../modules/constants"

interface LiveWorkPreferenceComboFieldsProps {
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

const LiveWorkPreferenceComboFields = ({
  liveOrWorkInSfClaimedOption,
  liveInSfMember,
  liveInSfProofType,
  liveInSfFileName,
  liveInSfFileUploadedAt,
  workInSfMember,
  workInSfProofType,
  workInSfFileName,
  workInSfFileUploadedAt,
}: LiveWorkPreferenceComboFieldsProps) => {
  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  // eslint-disable-next-line @typescript-eslint/unbound-method
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
      {liveOrWorkInSfClaimedOptionValue === "liveInSf" && (
        <LiveWorkPreferenceFields
          householdMemberFieldName={liveInSfMember}
          proofTypeFieldName={liveInSfProofType}
          proofTypeLabel={t("label.preferenceProofAddressDocuments")}
          proofTypeNote={t("e2cLiveWorkPreference.documentMustShowCorrectName")}
          proofFileName={liveInSfFileName}
          proofFileUploadedAt={liveInSfFileUploadedAt}
          proofTypeOptions={PROOF_OPTIONS.liveInSfAndNeighborhoodResidence}
        />
      )}
      {liveOrWorkInSfClaimedOptionValue === "workInSf" && (
        <LiveWorkPreferenceFields
          householdMemberFieldName={workInSfMember}
          proofTypeFieldName={workInSfProofType}
          proofTypeLabel={t("label.preferenceProofDocuments")}
          proofTypeNote={t("e2cLiveWorkPreference.documentMustShowCorrectNameForWork")}
          proofFileName={workInSfFileName}
          proofFileUploadedAt={workInSfFileUploadedAt}
          proofTypeOptions={PROOF_OPTIONS.workInSf}
        />
      )}
    </>
  )
}

export default LiveWorkPreferenceComboFields
