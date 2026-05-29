import React from "react"
import { useFormContext } from "react-hook-form"
import { Field, Select, t } from "@bloom-housing/ui-components"
import { Link } from "@bloom-housing/ui-seeds"
import { renderInlineMarkup } from "../../../../util/languageUtil"
import { getNestedError } from "../../../../util/formEngineUtil"
import PreferenceFields from "./PreferenceFields"
import { type PreferenceContent, type PreferenceFieldNames } from "./PreferenceUtils"
import styles from "./ListingApplyPreferenceStepWrapper.module.scss"

interface PreferenceToClaimComboProps {
  checkboxLabel: string
  checkboxDescription: string
  readMoreUrl?: string
  subPreferenceSelectLabel: string
  subPreferenceClaimed: string
  showRequiredCheckboxError: boolean
  onPreferenceCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  preferenceFieldNames: PreferenceFieldNames
  subPreferenceContents: PreferenceContent[]
  listingPreferenceId: string
}

const PreferenceToClaimCombo = ({
  checkboxLabel,
  checkboxDescription,
  readMoreUrl,
  subPreferenceSelectLabel,
  subPreferenceClaimed,
  showRequiredCheckboxError,
  onPreferenceCheckboxChange,
  listingPreferenceId,
  preferenceFieldNames,
  preferenceFieldNames: { preferenceClaimed },
  subPreferenceContents,
}: PreferenceToClaimComboProps) => {
  /* eslint-disable-next-line @typescript-eslint/unbound-method */
  const { register, watch, errors } = useFormContext()
  const preferenceComboClaimedValue = !!watch(preferenceClaimed)
  const subPreferenceClaimedValue: string = watch(subPreferenceClaimed)

  const selectedPreferenceContent = subPreferenceContents.find(
    (content) => content.preferenceName === subPreferenceClaimedValue
  )

  return (
    <div className={styles["preference-section"]}>
      <Field
        type="checkbox"
        name={preferenceClaimed}
        label={t(checkboxLabel)}
        register={register}
        error={showRequiredCheckboxError}
        onChange={onPreferenceCheckboxChange}
        className={styles["preference-checkbox"]}
        labelClassName={styles["preference-checkbox-label"]}
      />
      <div className={styles["preference-content-wrapper"]}>
        {checkboxDescription && (
          <div className={styles["preference-note"]}>
            {renderInlineMarkup(t(checkboxDescription))}
          </div>
        )}
        {readMoreUrl && (
          <Link
            href={readMoreUrl}
            hideExternalLinkIcon
            newWindowTarget
            className={styles["read-more-url"]}
          >
            {t("label.findOutMoreAboutPreferences")}
          </Link>
        )}
        {preferenceComboClaimedValue && (
          <>
            <Select
              id={subPreferenceClaimed}
              name={subPreferenceClaimed}
              label={t(subPreferenceSelectLabel)}
              options={subPreferenceContents.map((content) => ({
                label: t(content.checkboxLabel),
                value: content.preferenceName,
              }))}
              defaultValue={subPreferenceClaimedValue}
              placeholder={t("label.selectOne")}
              controlClassName="control"
              register={register}
              error={!!getNestedError(errors, subPreferenceClaimed)}
              errorMessage={t("error.pleaseSelectAnOption")}
              validation={{
                required: true,
              }}
            />
            {selectedPreferenceContent && (
              <PreferenceFields
                preferenceContent={selectedPreferenceContent}
                preferenceFieldNames={preferenceFieldNames}
                listingPreferenceId={listingPreferenceId}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PreferenceToClaimCombo
