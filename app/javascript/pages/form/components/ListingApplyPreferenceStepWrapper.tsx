import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, Field, t } from "@bloom-housing/ui-components"
import { Button, Card, FormErrorMessage } from "@bloom-housing/ui-seeds"
import type { RailsListingPreference } from "../../../api/types/rails/listings/RailsListingPreferences"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import ListingApplyStepErrorMessage from "./ListingApplyStepErrorMessage"
import { PREFERENCES } from "../../../modules/constants"
import PreferenceCheckbox from "./PreferenceCheckbox"
import { deleteUploadedProofFile } from "../../../api/formApiService"
import { generateStepDefaultValues, getNestedError } from "../../../util/formEngineUtil"
import { renderInlineMarkup } from "../../../util/languageUtil"
import styles from "./ListingApplyPreferenceStepWrapper.module.scss"

export type PreferenceContent = {
  preferenceName: string
  checkboxLabel: string
  checkboxDescription: string
  proofHouseholdMemberLabel?: string
  proofTypeLabel?: string
  proofTypeNote?: string
  proofTypeSingleValue?: string
  certificateNumberLabel?: string
  certificateNumberNote?: string
  proofUploadButtonLabel?: string
  proofUploadButtonNote?: string
  proofUploadButtonName?: string
}

// Preference pages have more complex fields, so we generate
// the fieldNames within the component, instead of in the schema
export type PreferenceFieldNames = {
  preferenceClaimed: string
  householdMemberId: string
  certificateNumber: string
  proofType: string
  proofFileName: string
  proofFileUploadedAt: string
}

export type ClaimedPreference = {
  preferenceClaimed: boolean
  householdMemberId?: string
  proofType?: string
  proofFileName?: string
  proofFileUploadedAt?: string
  certificateNumber?: string
}

// dot notation for nested values
// https://react-hook-form-website-git-leagcy-hook-form.vercel.app/v6/api/#register
const generatePreferenceFieldNames = (preferenceName: string): PreferenceFieldNames => ({
  preferenceClaimed: `${preferenceName}.preferenceClaimed`,
  householdMemberId: `${preferenceName}.householdMemberId`,
  certificateNumber: `${preferenceName}.certificateNumber`,
  proofType: `${preferenceName}.proofType`,
  proofFileName: `${preferenceName}.proofFileName`,
  proofFileUploadedAt: `${preferenceName}.proofFileUploadedAt`,
})

interface ListingApplyPreferenceStepWrapperProps {
  greenHeader?: boolean
  pageTitle: string
  pageInstructions: string
  fieldNames: {
    claimedPreferences: string
  }
  preferenceContents: PreferenceContent[]
  optOut?: boolean
}

const ListingApplyPreferenceStepWrapper = ({
  greenHeader,
  pageTitle,
  pageInstructions,
  fieldNames: { claimedPreferences }, // claimedPreferences object is used by all preference pages
  preferenceContents,
  optOut,
}: ListingApplyPreferenceStepWrapperProps) => {
  const {
    sessionId,
    staticData,
    formData,
    saveFormData,
    stepInfoMap,
    currentStepIndex,
    handleNextStep,
    handlePrevStep,
  } = useFormEngineContext()

  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  const listing = staticData.listing!
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  const preferences = staticData.preferences!
  const currentStepInfo = stepInfoMap[currentStepIndex]

  /**
   * using dot notation for fields results in nested data:
   * formData: {
   *   claimedPreferences: {
   *     liveInSf: {
   *       preferenceClaimed: true,
   *       ...
   *       proofFileName: 'gas-bill.pdf',
   *     },
   *     certificateOfPreference: {
   *       preferenceClaimed: false,
   *     }
   *   }
   * }
   */
  const claimedPreferenceValues = (generateStepDefaultValues(currentStepInfo, formData)[
    claimedPreferences
  ] || {}) as Record<string, ClaimedPreference>
  const defaultValues = preferenceContents.reduce(
    (acc, preferenceContent) => {
      return {
        ...acc,
        [preferenceContent.preferenceName]:
          claimedPreferenceValues[preferenceContent.preferenceName],
      } as Record<string, ClaimedPreference>
    },
    {} as Record<string, ClaimedPreference>
  )

  const formMethods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  /* eslint-disable-next-line @typescript-eslint/unbound-method */
  const { register, handleSubmit, errors, clearErrors, setValue, setError } = formMethods

  const [showRequiredCheckboxError, setShowRequiredCheckboxError] = useState(false)

  // TODO: for live/work preferences, conditionally render them based on household status
  // Angular code looks like:
  // const showLiveOrWorkCheckbox = Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length > 0
  // const showLiveCheckbox = Service.liveInSfMembers().length > 0 && Service.workInSfMembers().length == 0
  // const showWorkCheckbox = Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length == 0

  const getPreferenceData = (preferenceName: string): RailsListingPreference => {
    const preferenceLongName = PREFERENCES[preferenceName]
    if (!preferenceLongName) throw new Error(`${preferenceName} is not a valid preference name.`)

    const preference = preferences.find((pref) => pref.preferenceName === preferenceLongName)
    if (!preference) throw new Error(`${preferenceLongName} is missing for this listing.`)

    return preference
  }

  // checks for any errors *except* checkbox field errors
  const showIncompleteDocumentError = () => {
    for (const content of preferenceContents) {
      if (
        Object.values(generatePreferenceFieldNames(content.preferenceName)).some(
          (fieldName) =>
            !fieldName.includes(".preferenceClaimed") && getNestedError(errors, fieldName)
        )
      )
        return true
    }
    return false
  }

  const clearAllErrors = () => {
    clearErrors()
    setShowRequiredCheckboxError(false)
  }

  const handlePreferenceCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      setShowRequiredCheckboxError(false)
    }
    if (isChecked && optOut) {
      setValue("optOut", false)
    }
  }

  const handleOptOutCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      clearAllErrors()
      preferenceContents.forEach((content) => {
        setValue(`${content.preferenceName}.preferenceClaimed`, false)
      })
    }
  }

  const onSubmit = (data: {
    optOut?: boolean
    [preferenceName: string]: ClaimedPreference | boolean | undefined
  }) => {
    const { optOut: optOutValue, ...rest } = data
    const claimedPreferencesData = rest as Record<string, ClaimedPreference>

    const checkboxValues = [
      ...Object.values(claimedPreferencesData).map((val) => val.preferenceClaimed),
      optOut && optOutValue,
    ]

    // make sure at least one checkbox option is selected
    // this doesn't apply if there is no opt-out checkbox
    const somePrefsChecked = Object.values(checkboxValues).some((val) => !!val)
    if (!somePrefsChecked && optOut) {
      setShowRequiredCheckboxError(true)
      return
    }

    const unclaimedPreferences: Record<string, ClaimedPreference> = {}
    for (const content of preferenceContents) {
      const preference = claimedPreferencesData[content.preferenceName]
      // for every selected household member option, make sure there is an uploaded proof
      if (
        preference.preferenceClaimed &&
        preference.householdMemberId &&
        !preference.proofFileName
      ) {
        setError(`${content.preferenceName}.proofFileName`, {
          message: t("error.fileMissing"),
        })
        return
      }

      // for every unclaimed preference, remove proof data
      if (!preference.preferenceClaimed && preference.proofFileName) {
        unclaimedPreferences[content.preferenceName] = { preferenceClaimed: false }
        const listingPreferenceId = getPreferenceData(content.preferenceName).listingPreferenceID
        const proofTypeValue = preference.proofType || ""
        void deleteUploadedProofFile(sessionId, listing.Id, listingPreferenceId, proofTypeValue)
      }
    }

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
    })
    handleNextStep()
  }

  const headerClassNames = [
    styles["preference-header"],
    greenHeader ? styles["green-background"] : "",
  ].join(" ")

  return (
    <FormProvider {...formMethods}>
      <Card.Section className={greenHeader ? styles["back-section"] : ""}>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </Card.Section>
      <Card.Section className={headerClassNames}>
        <h1>{t(pageTitle)}</h1>
        <p>{renderInlineMarkup(t(pageInstructions))}</p>
      </Card.Section>
      {showRequiredCheckboxError && (
        <ListingApplyStepErrorMessage
          errorMessage={t("error.pleaseSelectPreferenceOption")}
          errorNote={t("error.pleaseSelectPreferenceContent")}
          onClose={() => clearAllErrors()}
        />
      )}
      {!showRequiredCheckboxError && showIncompleteDocumentError() && (
        <ListingApplyStepErrorMessage
          errorMessage={t("error.pleaseCompletePreference")}
          errorNote={t("error.pleaseCompletePreferenceContent")}
          onClose={() => clearAllErrors()}
        />
      )}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card.Section>
          <p className={styles["preference-instructions"]}>{t("label.pleaseSelectPreference")}</p>
          {preferenceContents.map((content) => (
            <PreferenceCheckbox
              key={content.preferenceName}
              showRequiredCheckboxError={showRequiredCheckboxError}
              onPreferenceCheckboxChange={handlePreferenceCheckboxChange}
              listingPreferenceId={getPreferenceData(content.preferenceName).listingPreferenceID}
              readMoreUrl={getPreferenceData(content.preferenceName).readMoreUrl}
              preferenceContent={content}
              preferenceFieldNames={generatePreferenceFieldNames(content.preferenceName)}
            />
          ))}
          {optOut && (
            <div className={styles["preference-section"]}>
              <Field
                type="checkbox"
                name="optOut"
                label={t("label.dontWantPreference")}
                register={register}
                error={showRequiredCheckboxError}
                onChange={handleOptOutCheckboxChange}
                className={styles["preference-checkbox"]}
                labelClassName={styles["preference-checkbox-label"]}
              />
              <div className={styles["preference-note"]}>
                {t("label.stillHaveOpportunityToClaim")}
              </div>
            </div>
          )}
          {showRequiredCheckboxError && (
            <FormErrorMessage>{t("error.pleaseSelectAnOption")}</FormErrorMessage>
          )}
        </Card.Section>
        <Card.Footer className={styles["step-footer"]}>
          <Button variant="primary" type="submit">
            {t("t.next")}
          </Button>
        </Card.Footer>
      </Form>
    </FormProvider>
  )
}

export default ListingApplyPreferenceStepWrapper
