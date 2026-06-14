import React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Field, t } from "@uic"
import { Link } from "@bloom-housing/ui-seeds"
import { renderInlineMarkup } from "../../../../util/languageUtil"
import { type PreferenceContent, type PreferenceFieldNames } from "./PreferenceUtils"
import PreferenceFields from "./PreferenceFields"
import styles from "./ListingApplyPreferenceStepWrapper.module.css"

interface PreferenceCheckboxProps {
  showRequiredCheckboxError: boolean
  onPreferenceCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  preferenceContent: PreferenceContent
  preferenceFieldNames: PreferenceFieldNames
  listingPreferenceId: string
  readMoreUrl?: string
}

const PreferenceToClaim = ({
  showRequiredCheckboxError,
  onPreferenceCheckboxChange,
  listingPreferenceId,
  readMoreUrl,
  preferenceContent,
  preferenceFieldNames,
}: PreferenceCheckboxProps) => {
  /* eslint-disable-next-line @typescript-eslint/unbound-method */
  const { register } = useFormContext()
  const { preferenceClaimed } = preferenceFieldNames
  const { checkboxLabel, checkboxDescription } = preferenceContent

  const checkBoxValue = useWatch({
    name: preferenceClaimed,
  })

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
        <div className={styles["preference-note"]}>
          {renderInlineMarkup(t(checkboxDescription))}
        </div>
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
        {!!checkBoxValue && (
          <PreferenceFields
            preferenceContent={preferenceContent}
            preferenceFieldNames={preferenceFieldNames}
            listingPreferenceId={listingPreferenceId}
          />
        )}
      </div>
    </div>
  )
}

export default PreferenceToClaim
