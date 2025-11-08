import React, { useState } from "react"
import { useForm, FormProvider, UseFormMethods } from "react-hook-form"
import { Form, Field, t } from "@bloom-housing/ui-components"
import { Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import LiveWorkPreferenceFields from "./LiveWorkPreferenceFields"
import LiveWorkPreferenceComboFields from "./LiveWorkPreferenceComboFields"
import styles from "./ListingApplyLiveWorkPreference.module.scss"

interface ListingApplyLiveWorkPreferenceProps {
  fieldNames: {
    liveOrWorkInSf: string
    liveOrWorkInSfClaimedOption: string
    liveInSf: string
    workInSf: string
    liveInSfMember: string
    liveInSfProofType: string
    liveInSfProofDoc: string
    workInSfMember: string
    workInSfProofType: string
    workInSfProofDoc: string
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
    liveInSfProofDoc,
    workInSfMember,
    workInSfProofType,
    workInSfProofDoc,
    optOutLiveWork,
  },
}: ListingApplyLiveWorkPreferenceProps) => {
  const formEngineContext = useFormEngineContext()
  const {
    formData,
    saveFormData,
    dataSources,
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

  const [showLiveOrWorkPrefFields, setShowLiveOrWorkPrefFields] = useState(
    !!getValues(liveOrWorkInSf)
  )
  const [showLivePrefFields, setShowLivePrefFields] = useState(!!getValues(liveInSf))
  const [showWorkPrefFields, setShowWorkPrefFields] = useState(!!getValues(workInSf))
  const [showRequiredCheckboxError, setShowRequiredCheckboxError] = useState(false)

  const showLiveOrWorkPrefCheckbox = true
  const showLivePrefCheckbox = false
  const showWorkPrefCheckbox = false
  // const showLiveOrWorkCheckbox = () => Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length > 0
  // const showLiveCheckbox = Service.liveInSfMembers().length > 0 && Service.workInSfMembers().length == 0
  // const showWorkCheckbox = Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length == 0

  const liveOrWorkInSfValue = formMethods.watch(liveOrWorkInSf)
  const liveInSfValue = watch(liveInSf)
  const workInSfValue = watch(workInSf)
  const optOutLiveWorkValue = watch(optOutLiveWork)

  const handleLiveWorkCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setShowLiveOrWorkPrefFields(isChecked)
    if (isChecked) {
      setShowRequiredCheckboxError(false)
      setValue(optOutLiveWork, false)
    }
  }

  const handleLiveCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setShowLivePrefFields(!isChecked)
    if (isChecked) {
      setShowRequiredCheckboxError(false)
      setValue(optOutLiveWork, false)
    }
  }

  const handleWorkCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setShowWorkPrefFields(isChecked)
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
      setValue(workInSf, false)
      setShowLiveOrWorkPrefFields(false)
      setShowWorkPrefFields(false)
      setShowLivePrefFields(false)
    }
  }

  const onSubmit = (data: Record<string, unknown>) => {
    if (liveOrWorkInSfValue || liveInSfValue || workInSfValue || optOutLiveWorkValue) {
      saveFormData(data)
      handleNextStep()
    } else {
      setShowRequiredCheckboxError(true)
    }
  }

  return (
    <FormProvider {...formMethods}>
      <pre>{JSON.stringify(getValues(), null, 2)}</pre>

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
              {showLiveOrWorkPrefFields && <LiveWorkPreferenceComboFields {...fieldNames} />}
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
              {showLivePrefFields && (
                <LiveWorkPreferenceFields
                  householdMemberFieldName={liveInSfMember}
                  proofTypeFieldName={liveInSfProofType}
                  proofDocFieldName={liveInSfProofDoc}
                  proofTypeLabel={t("label.preferenceProofAddressDocuments")}
                  proofTypeNote={t("e2cLiveWorkPreference.documentMustShowCorrectName")}
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
              {showWorkPrefFields && (
                <LiveWorkPreferenceFields
                  householdMemberFieldName={workInSfMember}
                  proofTypeFieldName={workInSfProofType}
                  proofDocFieldName={workInSfProofDoc}
                  proofTypeLabel={t("label.preferenceProofDocuments")}
                  proofTypeNote={t("e2cLiveWorkPreference.documentMustShowCorrectNameForWork")}
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
