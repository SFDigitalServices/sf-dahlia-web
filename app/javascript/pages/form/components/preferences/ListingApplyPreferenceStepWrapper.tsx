import React, { useState, useEffect, useRef } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, Field, t } from "@bloom-housing/ui-components"
import { Button, Card, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import getFormComponentRegistry from "../../../../formEngine/formComponentRegistry"
import ListingApplyStepErrorMessage from "../ListingApplyStepErrorMessage"
import PreferenceToClaim from "./PreferenceToClaim"
import PreferenceToClaimCombo from "./PreferenceToClaimCombo"
import { generateStepDefaultValues, getNestedError } from "../../../../util/formEngineUtil"
import { renderInlineMarkup } from "../../../../util/languageUtil"
import {
  type ClaimedPreference,
  type PreferenceContent,
  generatePreferenceFieldNames,
  getPreferenceData,
} from "./PreferenceUtils"
import styles from "./ListingApplyPreferenceStepWrapper.module.scss"
import stepStyles from "../ListingApplyStepWrapper.module.scss"

interface ListingApplyPreferenceStepWrapperProps {
  greenHeader?: boolean
  headerComponentName?: string
  title: string
  description: string
  liveInSf?: string
  workInSf?: string
  liveWorkInSf?: string
  fieldNames: {
    claimedPreferences: string // claimedPreferences object is used by all preference pages, it should be the same string for all preference pages in the schema
    optOut?: string
    subPreferenceClaimed?: string
  }
  preferenceContents: PreferenceContent[]
  comboPreference?: {
    checkboxLabel: string
    checkboxDescription: string
    preferenceName: string
    subPreferenceSelectLabel: string
  }
}

const ListingApplyPreferenceStepWrapper = ({
  headerComponentName,
  greenHeader,
  title,
  description,
  liveInSf,
  workInSf,
  liveWorkInSf,
  fieldNames: { claimedPreferences, optOut, subPreferenceClaimed },
  preferenceContents,
  comboPreference,
}: ListingApplyPreferenceStepWrapperProps) => {
  const {
    staticData,
    formData,
    saveFormData,
    stepInfoMap,
    currentStepIndex,
    handleNextStep,
    handlePrevStep,
  } = useFormEngineContext()

  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  const preferences = staticData.preferences!
  const currentStepInfo = stepInfoMap[currentStepIndex]

  // Determine which live/work fields to show based on eligibility
  const liveEligible = !liveInSf || formData[liveInSf] === "true"
  const workEligible = !workInSf || formData[workInSf] === "true"
  const liveWorkEligible = !liveWorkInSf || formData[liveWorkInSf] === "true"
  const showComboPreference = comboPreference && subPreferenceClaimed && liveWorkEligible
  const eligiblePreferenceContents = preferenceContents.filter((content) => {
    if (content.preferenceName === "liveInSf") return liveEligible
    if (content.preferenceName === "workInSf") return workEligible
    return true
  })

  let headerComponent
  if (headerComponentName) {
    const componentRegistry = getFormComponentRegistry()
    headerComponent = React.createElement(componentRegistry[headerComponentName])
  }

  const formMethods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
  })

  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  /* eslint-disable @typescript-eslint/unbound-method */
  const { reset, register, handleSubmit, formState, clearErrors, setValue } = formMethods
  const { errors } = formState
  /* eslint-enable @typescript-eslint/unbound-method */

  // populate the page's form values from formData
  useEffect(() => {
    const stepDefaultValues = generateStepDefaultValues(currentStepInfo, formData)
    const optOutValue = optOut && !!stepDefaultValues[optOut]
    const subPreferenceClaimedValue =
      subPreferenceClaimed && stepDefaultValues[subPreferenceClaimed]
    const claimedPreferencesValue = (stepDefaultValues[claimedPreferences] || {}) as Record<
      string,
      ClaimedPreference
    >
    const defaultClaimedPreferencesValues = {
      ...eligiblePreferenceContents.reduce(
        (acc, preferenceContent) => ({
          ...acc,
          [preferenceContent.preferenceName]:
            claimedPreferencesValue[preferenceContent.preferenceName] || {},
        }),
        {} as Record<string, ClaimedPreference>
      ),
      ...(showComboPreference && {
        [comboPreference.preferenceName]:
          claimedPreferencesValue[comboPreference.preferenceName] || {},
      }),
    }

    reset({
      ...(optOut && { [optOut]: optOutValue }),
      ...(subPreferenceClaimed && { [subPreferenceClaimed]: subPreferenceClaimedValue }),
      [claimedPreferences]: defaultClaimedPreferencesValues,
    })
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [reset])

  const errorSectionRef = useRef<HTMLDivElement>(null)
  const [showRequiredCheckboxError, setShowRequiredCheckboxError] = useState(false)
  const [showGenericError, setShowGenericError] = useState(false)
  const [showMissingDocumentError, setShowMissingDocumentError] = useState(false)

  // If live/work status is updated on other pages, reset claimed preferences
  useEffect(() => {
    const existingClaimedPreferences = (formData[claimedPreferences] || {}) as Record<
      string,
      ClaimedPreference
    >
    const stalePreferences: string[] = []
    if (liveInSf && !liveEligible) stalePreferences.push("liveInSf")
    if (workInSf && !workEligible) stalePreferences.push("workInSf")
    if (comboPreference && liveWorkInSf && !showComboPreference)
      stalePreferences.push(comboPreference.preferenceName)

    const claimedPreferencesToRemove = stalePreferences.filter(
      (key) => existingClaimedPreferences[key]?.preferenceClaimed
    )

    const subPreferenceValue = subPreferenceClaimed
      ? (formData[subPreferenceClaimed] as string)
      : ""
    const hasStaleSubPreference =
      (subPreferenceValue === "liveInSf" && !liveEligible) ||
      (subPreferenceValue === "workInSf" && !workEligible)

    if (claimedPreferencesToRemove.length === 0 && !hasStaleSubPreference) return

    const updatedClaimedPreferences = Object.fromEntries(
      Object.entries(existingClaimedPreferences).filter(
        ([key]) => !claimedPreferencesToRemove.includes(key)
      )
    )

    if (hasStaleSubPreference && subPreferenceClaimed) {
      setValue(subPreferenceClaimed, "")
      saveFormData({
        [claimedPreferences]: updatedClaimedPreferences,
        [subPreferenceClaimed]: "",
      })
    } else {
      saveFormData({ [claimedPreferences]: updatedClaimedPreferences })
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  // checks for any errors *except* preference-to-claim checkbox field errors
  const showErrorHeaders = () => {
    const preferenceNames = preferenceContents.map((content) => content.preferenceName)
    if (comboPreference) preferenceNames.push(comboPreference.preferenceName)

    const fieldNamesWithErrors = preferenceNames
      .flatMap((preferenceName) =>
        Object.values(generatePreferenceFieldNames(claimedPreferences, preferenceName))
      )
      .filter((fieldName) => getNestedError(errors, fieldName))

    const hasMissingDocumentError = fieldNamesWithErrors.some((fieldName) =>
      fieldName.includes(".proofFileName")
    )
    const hasGenericError =
      fieldNamesWithErrors.some(
        (fieldName) =>
          !fieldName.includes(".preferenceClaimed") && !fieldName.includes(".proofFileName")
      ) || !!(comboPreference && subPreferenceClaimed && errors[subPreferenceClaimed])

    setShowMissingDocumentError(hasMissingDocumentError)
    setShowGenericError(hasGenericError)
  }
  useEffect(showErrorHeaders, [
    formState,
    errors, // we need to use `formState` instead of `errors`, but linter will complain if `errors` is missing
    claimedPreferences,
    comboPreference,
    preferenceContents,
    subPreferenceClaimed,
  ])

  const clearAllErrors = () => {
    clearErrors()
    setShowRequiredCheckboxError(false)
    setShowGenericError(false)
    setShowMissingDocumentError(false)
  }

  const handlePreferenceCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      setShowRequiredCheckboxError(false)
    }
    if (isChecked && optOut) {
      setValue(optOut, false)
    }
  }

  const handleOptOutCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      clearAllErrors()
      preferenceContents.forEach((content) => {
        setValue(`${claimedPreferences}.${content.preferenceName}.preferenceClaimed`, false)
      })
    }
    if (isChecked && comboPreference) {
      setValue(`${claimedPreferences}.${comboPreference.preferenceName}.preferenceClaimed`, false)
    }
  }

  /**
   * using dot notation for fields results in nested data:
   * formData: {
   *   _liveOrWorkInSfOptOut: false,
   *   _assistedHousingOptOut: true,
   *   _liveOrWorkInSfClaimedPreference: 'liveInSf',
   *   claimedPreferences: {
   *     assistedHousing: { preferenceClaimed: false },
   *     liveWorkInSf: {
   *       preferenceClaimed: true,
   *       ...
   *       proofFileName: 'gas-bill.pdf',
   *     },
   *   }
   * }
   */
  const onSubmit = (data: { [key: string]: boolean | Record<string, ClaimedPreference> }) => {
    const optOutValue = !!optOut && (data[optOut] as boolean)
    const subPreferenceClaimedValue = subPreferenceClaimed && data[subPreferenceClaimed]
    const claimedPreferencesData = data[claimedPreferences] as Record<string, ClaimedPreference>

    const checkboxValues = [
      ...Object.values(claimedPreferencesData).map((val) => val.preferenceClaimed),
      optOutValue,
    ]

    // make sure at least one checkbox option is selected
    // users can submit without checking any checkbox if there is no opt-out checkbox
    const somePrefsChecked = Object.values(checkboxValues).some((val) => !!val)
    if (!somePrefsChecked && optOut) {
      setShowRequiredCheckboxError(true)
      return
    }

    const unclaimedPreferences: Record<string, ClaimedPreference> = {}
    const newClaimedPreference = { ...claimedPreferencesData, ...unclaimedPreferences }
    const existingClaimedPreferences = formData[claimedPreferences] as Record<
      string,
      ClaimedPreference
    >
    saveFormData({
      [claimedPreferences]: {
        ...existingClaimedPreferences,
        ...newClaimedPreference,
      },
      ...(optOut && { [optOut]: optOutValue }),
      ...(subPreferenceClaimed && { [subPreferenceClaimed]: subPreferenceClaimedValue }),
    })
    handleNextStep()
  }

  const onError = () => {
    errorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const headerClassNames = [
    styles["preference-header"],
    greenHeader ? styles["green-background"] : "",
  ].join(" ")

  return (
    <FormProvider {...formMethods}>
      <Card.Section className={greenHeader ? styles["back-section"] : ""}>
        <Button variant="text" className={stepStyles["back-button"]} onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </Card.Section>
      {headerComponent ? (
        <>{headerComponent}</>
      ) : (
        <Card.Header className={headerClassNames} divider="inset">
          <h1 className={styles["step-title"]}>{t(title)}</h1>
          <p className={styles["step-description"]}>{renderInlineMarkup(t(description))}</p>
        </Card.Header>
      )}
      <div ref={errorSectionRef}>
        {showRequiredCheckboxError && (
          <ListingApplyStepErrorMessage
            errorMessage={t("error.pleaseSelectPreferenceOption")}
            errorNote={t("error.pleaseSelectPreferenceContent")}
            onClose={() => clearAllErrors()}
          />
        )}
        {!showRequiredCheckboxError && showMissingDocumentError && (
          <ListingApplyStepErrorMessage
            errorMessage={t("error.pleaseCompletePreference")}
            errorNote={t("error.pleaseCompletePreferenceContent")}
            onClose={() => clearAllErrors()}
          />
        )}
        {!showRequiredCheckboxError && !showMissingDocumentError && showGenericError && (
          <ListingApplyStepErrorMessage
            errorMessage={t("error.formSubmission")}
            onClose={() => clearAllErrors()}
          />
        )}
      </div>
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <Card.Section>
          <p className={styles["preference-instructions"]}>{t("label.pleaseSelectPreference")}</p>
          {showComboPreference && (
            <PreferenceToClaimCombo
              checkboxLabel={comboPreference.checkboxLabel}
              checkboxDescription={comboPreference.checkboxDescription}
              subPreferenceSelectLabel={comboPreference.subPreferenceSelectLabel}
              subPreferenceClaimed={subPreferenceClaimed}
              showRequiredCheckboxError={showRequiredCheckboxError}
              onPreferenceCheckboxChange={handlePreferenceCheckboxChange}
              preferenceFieldNames={generatePreferenceFieldNames(
                claimedPreferences,
                comboPreference.preferenceName
              )}
              subPreferenceContents={preferenceContents}
              listingPreferenceId={
                getPreferenceData(preferences, comboPreference.preferenceName).listingPreferenceID
              }
              readMoreUrl={
                getPreferenceData(preferences, comboPreference.preferenceName).readMoreUrl
              }
            />
          )}
          {!showComboPreference &&
            eligiblePreferenceContents.map((content) => (
              <PreferenceToClaim
                key={content.preferenceName}
                showRequiredCheckboxError={showRequiredCheckboxError}
                onPreferenceCheckboxChange={handlePreferenceCheckboxChange}
                listingPreferenceId={
                  getPreferenceData(preferences, content.preferenceName).listingPreferenceID
                }
                readMoreUrl={getPreferenceData(preferences, content.preferenceName).readMoreUrl}
                preferenceContent={content}
                preferenceFieldNames={generatePreferenceFieldNames(
                  claimedPreferences,
                  content.preferenceName
                )}
              />
            ))}
          {optOut && (
            <div className={styles["preference-section"]}>
              <Field
                type="checkbox"
                name={optOut}
                label={t("label.dontWantPreference")}
                register={register}
                error={showRequiredCheckboxError}
                onChange={handleOptOutCheckboxChange}
                className={styles["preference-checkbox"]}
                labelClassName={styles["preference-checkbox-label"]}
              />
              <div className={styles["preference-content-wrapper"]}>
                <div className={styles["preference-note"]}>
                  {t("label.stillHaveOpportunityToClaim")}
                </div>
              </div>
            </div>
          )}
          {showRequiredCheckboxError && (
            <FormErrorMessage>{t("error.pleaseSelectAnOption")}</FormErrorMessage>
          )}
        </Card.Section>
        <Card.Footer className={stepStyles["step-footer"]}>
          <Button variant="primary" type="submit">
            {t("t.next")}
          </Button>
        </Card.Footer>
      </Form>
    </FormProvider>
  )
}

export default ListingApplyPreferenceStepWrapper
