import React, { useState } from "react"
import { useForm, FormProvider, UseFormMethods } from "react-hook-form"
import { Form, Field, t } from "@bloom-housing/ui-components"
import { Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import LiveWorkPreferenceFields from "./LiveWorkPreferenceFields"
import LiveWorkPreferenceComboFields from "./LiveWorkPreferenceComboFields"
import ListingApplyStepErrorMessage from "./ListingApplyStepErrorMessage"
import styles from "./ListingApplyLiveWorkPreference.module.scss"
import { deleteUploadedProofFile } from "../../../api/formApiService"
import { PREFERENCES, PROOF_OPTIONS } from "../../../modules/constants"

interface ListingApplyLiveWorkPreferenceProps {
  fieldNames: {
    liveOrWorkInSf: string
    liveOrWorkInSfClaimedOption: string
    liveInSf: string
    workInSf: string
    liveInSfMember: string
    liveInSfProofType: string
    liveInSfProofDoc: string
    liveInSfFileName: string
    liveInSfFileUploadedAt: string
    workInSfMember: string
    workInSfProofType: string
    workInSfProofDoc: string
    workInSfFileName: string
    workInSfFileUploadedAt: string
    optOutLiveWork: string
  }
}

const ListingApplyLiveWorkPreference = ({
  fieldNames,
  fieldNames: {
    liveOrWorkInSfClaimedOption,
    liveOrWorkInSf,
    liveInSf,
    workInSf,
    liveInSfMember,
    liveInSfProofType,
    liveInSfFileName,
    liveInSfFileUploadedAt,
    workInSfMember,
    workInSfProofType,
    workInSfFileName,
    workInSfFileUploadedAt,
    optOutLiveWork,
  },
}: ListingApplyLiveWorkPreferenceProps) => {
  const formEngineContext = useFormEngineContext()
  const {
    sessionId,
    listing,
    preferences,
    formData,
    saveFormData,
    stepInfoMap,
    currentStepIndex,
    handleNextStep,
    handlePrevStep,
  } = formEngineContext

  const currentStepInfo = stepInfoMap[currentStepIndex]
  const defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = formData[fieldName]
    return acc
  }, {})

  const formMethods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, handleSubmit, errors, clearErrors } = formMethods
  // workaround for react-hook-form typescript issue with these function signatures
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const setValue = formMethods.setValue as UseFormMethods["setValue"]
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const setError = formMethods.setError as UseFormMethods["setError"]

  const [showRequiredCheckboxError, setShowRequiredCheckboxError] = useState(false)

  // TODO: implement similar logic from Angular, once we have household member data (tests will need updates as well)
  // const showLiveOrWorkCheckbox = Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length > 0
  // const showLiveCheckbox = Service.liveInSfMembers().length > 0 && Service.workInSfMembers().length == 0
  // const showWorkCheckbox = Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length == 0
  const showLiveOrWorkPrefCheckbox = true
  const showLivePrefCheckbox = false
  const showWorkPrefCheckbox = false

  const liveOrWorkInSfValue: boolean = watch(liveOrWorkInSf)
  const liveInSfValue: boolean = watch(liveInSf)
  const liveInSfMemberValue: string = watch(liveInSfMember)
  const liveInSfProofTypeValue: string = watch(liveInSfProofType)
  const liveInSfFileNameValue: string = watch(liveInSfFileName)
  const workInSfValue: boolean = watch(workInSf)
  const workInSfMemberValue: string = watch(workInSfMember)
  const workInSfProofTypeValue: string = watch(workInSfProofType)
  const workInSfFileNameValue: string = watch(workInSfFileName)
  const optOutLiveWorkValue: boolean = watch(optOutLiveWork)

  const clearAllErrors = () => {
    clearErrors()
    setShowRequiredCheckboxError(false)
  }

  const handleLiveWorkCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      setShowRequiredCheckboxError(false)
      setValue(optOutLiveWork, false)
    }
  }

  const handleLiveCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      setShowRequiredCheckboxError(false)
      setValue(optOutLiveWork, false)
    }
  }

  const handleWorkCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      setShowRequiredCheckboxError(false)
      setValue(optOutLiveWork, false)
    }
  }

  const handleOptOutCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      clearAllErrors()
      setValue(liveOrWorkInSf, false)
      setValue(liveInSf, false)
      setValue(liveInSfProofType, null)
      setValue(liveInSfFileName, null)
      setValue(liveInSfFileUploadedAt, null)
      setValue(workInSf, false)
      setValue(workInSfProofType, null)
      setValue(workInSfFileName, null)
      setValue(workInSfFileUploadedAt, null)
    }
  }

  const showIncompleteDocumentError =
    errors?.[liveOrWorkInSfClaimedOption] ||
    errors?.[liveInSfMember] ||
    errors?.[liveInSfProofType] ||
    errors?.[liveInSfFileName] ||
    errors?.[workInSfMember] ||
    errors?.[workInSfProofType] ||
    errors?.[workInSfFileName]

  const deleteUploadedFile = (proofType: string) => {
    const listingPreferenceId = preferences.find(
      (pref) => pref.preferenceName === PREFERENCES.liveWorkInSf
    )?.listingPreferenceID

    if (!listingPreferenceId) return

    void deleteUploadedProofFile(sessionId, listing.Id, listingPreferenceId, proofType)
  }

  const onSubmit = (data: Record<string, unknown>) => {
    if (!liveOrWorkInSfValue && !liveInSfValue && !workInSfValue && !optOutLiveWorkValue) {
      setShowRequiredCheckboxError(true)
      return
    }

    if (liveInSfMemberValue && !liveInSfFileNameValue) {
      setError(liveInSfFileName, {
        message: t("error.fileMissing"),
      })
      return
    }

    if (workInSfMemberValue && !workInSfFileNameValue) {
      setError(workInSfFileName, {
        message: t("error.fileMissing"),
      })
      return
    }

    // applicant may have uploaded a file, and then opted out
    if (!liveInSfFileNameValue) deleteUploadedFile(liveInSfProofTypeValue)
    if (!workInSfFileNameValue) deleteUploadedFile(workInSfProofTypeValue)

    // conditional rendering of fields may remove them from the form object
    // make sure all fields are in the form object so that we remove old field data
    // e.g. applicant claims a preference, then goes back and opts out of it
    const allFields = {}
    Object.values(fieldNames).forEach((field) => (allFields[field] = ""))

    saveFormData({ ...allFields, ...data })
    handleNextStep()
  }

  return (
    <FormProvider {...formMethods}>
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <CardSection>
        <h1 className="mt-6 mb-4 text-xl md:text-2xl">{t("e2cLiveWorkPreference.title")}</h1>
        <p className="field-note text-base">{t("e2cLiveWorkPreference.instructions")}</p>
      </CardSection>

      {showRequiredCheckboxError && (
        <ListingApplyStepErrorMessage
          errorMessage={t("error.pleaseSelectPreferenceOption")}
          errorNote={t("error.pleaseSelectPreferenceContent")}
          onClose={() => clearAllErrors()}
        />
      )}

      {!showRequiredCheckboxError && showIncompleteDocumentError && (
        <ListingApplyStepErrorMessage
          errorMessage={t("error.pleaseCompletePreference")}
          errorNote={t("error.pleaseCompletePreferenceContent")}
          onClose={() => clearAllErrors()}
        />
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <CardSection>
          <p className={styles["checkbox-label"]}>{t("label.pleaseSelectPreference")}</p>
          {showLiveOrWorkPrefCheckbox && (
            <div className={styles["checkbox-section"]}>
              <Field
                type="checkbox"
                name={liveOrWorkInSf}
                label={t("e2cLiveWorkPreference.liveWorkSfPreference.title")}
                subNote={t("e2cLiveWorkPreference.liveWorkSfPreference.description")}
                error={showRequiredCheckboxError}
                register={register}
                onChange={handleLiveWorkCheckboxChange}
              />
              {liveOrWorkInSfValue && <LiveWorkPreferenceComboFields {...fieldNames} />}
            </div>
          )}

          {showLivePrefCheckbox && (
            <div className={styles["checkbox-section"]}>
              <Field
                type="checkbox"
                name={liveInSf}
                label={t("e2cLiveWorkPreference.liveSfPreference.title")}
                subNote={t("e2cLiveWorkPreference.liveSfPreference.description")}
                register={register}
                error={showRequiredCheckboxError}
                onChange={handleLiveCheckboxChange}
              />
              {liveInSfValue && (
                <LiveWorkPreferenceFields
                  householdMemberFieldName={liveInSfMember}
                  proofTypeFieldName={liveInSfProofType}
                  proofTypeLabel={t("label.preferenceProofAddressDocuments")}
                  proofTypeNote={t("e2cLiveWorkPreference.documentMustShowCorrectName")}
                  proofFileName={liveInSfFileName}
                  proofFileUploadedAt={liveInSfFileUploadedAt}
                  proofTypeOptions={PROOF_OPTIONS.liveInSf}
                />
              )}
            </div>
          )}

          {showWorkPrefCheckbox && (
            <div className={styles["checkbox-section"]}>
              <Field
                type="checkbox"
                name={workInSf}
                label={t("e2cLiveWorkPreference.workSfPreference.title")}
                subNote={t("e2cLiveWorkPreference.workSfPreference.description")}
                register={register}
                error={showRequiredCheckboxError}
                onChange={handleWorkCheckboxChange}
              />
              {workInSfValue && (
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
            </div>
          )}

          <Field
            type="checkbox"
            name={optOutLiveWork}
            label={t("label.dontWantPreference")}
            subNote={t("label.stillHaveOpportunityToClaim")}
            register={register}
            error={showRequiredCheckboxError}
            onChange={handleOptOutCheckboxChange}
          />

          {showRequiredCheckboxError && (
            <FormErrorMessage>{t("error.pleaseSelectAnOption")}</FormErrorMessage>
          )}
        </CardSection>
        <CardSection>
          <Button variant="primary" type="submit">
            {t("t.next")}
          </Button>
        </CardSection>
      </Form>
    </FormProvider>
  )
}

export default ListingApplyLiveWorkPreference
