/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"
import { EMAIL_REGEX, LISTING_APPLY_FORMS_INPUT_MAX_LENGTH } from "../../../modules/constants"
import "./EmailAddress.scss"

interface EmailAddressProps {
  label: string
  fieldNames: {
    email: string
    noEmail?: string
  }
  showDontHaveEmailAddress?: boolean
  note?: string
}

const EmailAddress = ({
  label,
  fieldNames: { email, noEmail },
  showDontHaveEmailAddress,
  note,
}: EmailAddressProps) => {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
  } = useFormContext()
  const [noEmailCheckbox, setNoEmailCheckbox] = React.useState(false)
  return (
    <fieldset>
      <Field
        name={email}
        label={t(label)}
        register={register}
        disabled={noEmailCheckbox}
        subNote={t(note)}
        className="email-address-field"
        validation={{
          required: !noEmailCheckbox,
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
          name={noEmail}
          label={t("label.applicantNoEmail")}
          register={register}
          onChange={(e) => {
            const isChecked = e.target.checked
            setNoEmailCheckbox(isChecked)
            if (isChecked) {
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
