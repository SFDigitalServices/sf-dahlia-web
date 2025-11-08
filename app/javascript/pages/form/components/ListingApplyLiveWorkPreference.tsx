import React, { useState } from "react"
import { useForm, FormProvider, UseFormMethods } from "react-hook-form"
import { Form, Field, t } from "@bloom-housing/ui-components"
import { Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import LiveWorkPreferenceFields from "./LiveWorkPreferenceFields"
import LiveWorkPreferenceComboFields from "./LiveWorkPreferenceComboFields"
import styles from "./ListingApplyLiveWorkPreference.module.scss"
import { deleteUploadedProofFile } from "../../../api/formApiService"
import { PREFERENCES } from "../../../modules/constants"

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
    // dataSources,
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

  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const formMethods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const { register, watch, handleSubmit } = formMethods
  // workaround for react-hook-form typescript issue with these function signatures
  const setValue = formMethods.setValue as UseFormMethods["setValue"]
  const getValues = formMethods.getValues as UseFormMethods["getValues"]

  const [showRequiredCheckboxError, setShowRequiredCheckboxError] = useState(false)

  const showLiveOrWorkPrefCheckbox = true
  const showLivePrefCheckbox = false
  const showWorkPrefCheckbox = false
  // TODO: implement similar logic from Angular, once we have household member data
  // const showLiveOrWorkCheckbox = Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length > 0
  // const showLiveCheckbox = Service.liveInSfMembers().length > 0 && Service.workInSfMembers().length == 0
  // const showWorkCheckbox = Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length == 0

  const liveOrWorkInSfValue = watch(liveOrWorkInSf)
  const liveInSfValue = watch(liveInSf)
  const liveInSfFileNameValue = watch(liveInSfFileName)
  const workInSfValue = watch(workInSf)
  const workInSfFileNameValue = watch(workInSfFileName)
  const optOutLiveWorkValue = watch(optOutLiveWork)

  const handleLiveWorkCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => { // TODO not needed?
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
      setShowRequiredCheckboxError(false)
      setValue(liveOrWorkInSf, false)
      setValue(liveInSf, false)
      setValue(liveInSfProofType, null)
      setValue(workInSf, false)
      setValue(workInSfProofType, null)
    }
  }

  const deleteUploadedFile = (proofType: string) => {
    const listingPreferenceId = preferences.find(
      (pref) => pref.preferenceName === PREFERENCES.liveWorkInSf
    ).listingPreferenceID

    deleteUploadedProofFile(sessionId, listing.Id, listingPreferenceId, proofType)
      .catch((error) => {
        console.error("file delete error: ", error)
      })
  }

  const foo = (data: Record<string, unknown>) => {
    
  }

  const onSubmit = (data: Record<string, unknown>) => {
    if (!liveOrWorkInSfValue && !liveInSfValue && !workInSfValue && !optOutLiveWorkValue) {
      setShowRequiredCheckboxError(true)
      return
    }

    // applicant may have uploaded a file, and then opted out
    if (!liveInSfFileNameValue) deleteUploadedFile(liveInSfProofType)
    if (!workInSfFileNameValue) deleteUploadedFile(workInSfProofType)

    // conditional rendering of fields may remove them from the form object
    // make sure all fields are in the form object so that we remove old field data
    // e.g. applicant claims a preference, then goes back and opts out of it
    const allFields = {}
    Object.values(fieldNames).forEach((field) => allFields[field] = '')

    saveFormData({ ...allFields, ...data})
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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <CardSection>
          {showLiveOrWorkPrefCheckbox && (
            <div className={styles["checkbox-section"]}>
              <Field
                type="checkbox"
                name={liveOrWorkInSf}
                className={styles["live-work-pref-field"]}
                label={t("e2cLiveWorkPreference.liveWorkSfPreference.title")}
                subNote={t("e2cLiveWorkPreference.liveWorkSfPreference.description")}
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
