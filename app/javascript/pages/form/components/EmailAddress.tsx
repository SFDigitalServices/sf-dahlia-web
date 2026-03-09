/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"
import { EMAIL_REGEX, LISTING_APPLY_FORMS_INPUT_MAX_LENGTH } from "../../../modules/constants"
import styles from "./EmailAddress.module.scss"

interface EmailAddressProps {
  label: string
  fieldNames: {
    email: string
    noEmailCheckbox?: string
  }
  showDontHaveEmailAddress?: boolean
  note?: string
}

const EmailAddress = ({
  label,
  fieldNames: { email, noEmailCheckbox },
  showDontHaveEmailAddress,
  note,
}: EmailAddressProps) => {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
  } = useFormContext()
  const noEmailCheckboxValue = watch(noEmailCheckbox, false)
  return (
    <fieldset>
      <legend className="legend-header">{t(label)}</legend>
      <Field
        name={email}
        register={register}
        disabled={noEmailCheckboxValue}
        subNote={t(note)}
        placeholder={noEmailCheckboxValue ? t("t.none") : ""}
        className={styles["email-address-field"]}
        validation={{
          required: !noEmailCheckboxValue,
          maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.email,
          pattern: {
            value: EMAIL_REGEX,
            message: t("error.email"),
          },
        }}
        error={!!errors?.[email]}
        errorMessage={t("error.email")}
      />
      {showDontHaveEmailAddress && (
        <Field
          type="checkbox"
          name={noEmailCheckbox}
          label={t("label.applicantNoEmail")}
          className={styles["email-address-checkbox"]}
          register={register}
          onChange={(e) => {
            if (e.target.checked) {
              setValue(email, "")
              clearErrors(email)
            }
          }}
        />
      )}
    </fieldset>
  )
}

export default EmailAddress
