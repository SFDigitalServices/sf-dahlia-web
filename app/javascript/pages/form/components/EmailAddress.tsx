import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import { EMAIL_REGEX, LISTING_APPLY_FORMS_INPUT_MAX_LENGTH } from "../../../modules/constants"

interface EmailAddressProps {
  label: string
  fieldNames: {
    email: string
  }
  showDontHaveEmailAddress?: boolean
  note?: string
}

const EmailAddress = ({
  label,
  fieldNames: { email },
  showDontHaveEmailAddress,
  note,
}: EmailAddressProps) => {
  const { register, errors } = useFormStepContext()
  const [noEmail, setNoEmail] = React.useState(false)
  return (
    <>
      <Heading priority={2} size="sm">
        {t(label)}
      </Heading>
      <fieldset>
        <Field
          name={email}
          label={t(note)}
          register={register}
          disabled={noEmail}
          validation={{
            required: !noEmail,
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
            name="showDontHaveEmailAddress"
            label={t("label.applicantNoEmail")}
            register={register}
            onChange={(e) => {
              setNoEmail(e.target.checked)
            }}
          />
        )}
      </fieldset>
    </>
  )
}

export default EmailAddress
