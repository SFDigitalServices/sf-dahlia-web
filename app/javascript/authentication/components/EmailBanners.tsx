import { t } from "@bloom-housing/ui-components"
import { Alert } from "@bloom-housing/ui-seeds"
import React from "react"
import { confirmEmail } from "../../api/authApiService"

export const requestEmail = (
  email: string,
  setEmailSent: (value: boolean) => void,
  setEmailSentError: (value: string | null) => void
) => {
  confirmEmail(email)
    .then(() => {
      setEmailSent(true)
    })
    .catch(() => {
      setEmailSentError(t("signIn.newAccount.sendEmailAgainButton.error"))
    })
}

export const EmailBanners = ({
  emailSent,
  emailSentError,
}: {
  emailSent: boolean
  emailSentError: string
}) => {
  return (
    <>
      {emailSent && (
        <Alert className="sign-in-banner banner-background-color">
          {t("signIn.newAccount.sendEmailAgainButton.confirmation")}
        </Alert>
      )}
      {emailSentError && (
        <Alert variant="alert" className="sign-in-banner">
          {emailSentError}
        </Alert>
      )}
    </>
  )
}
