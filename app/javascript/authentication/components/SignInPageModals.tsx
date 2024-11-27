import { AppearanceStyleType, Button, t } from "@bloom-housing/ui-components"
import React, { useState } from "react"
import { confirmEmail } from "../../api/authApiService"
import { Alert, Dialog } from "@bloom-housing/ui-seeds"

export const AccountAlreadyConfirmedModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <Dialog.Header>{t("signIn.accountAlreadyConfirmed.title")}</Dialog.Header>
      <Dialog.Content>{t("signIn.accountAlreadyConfirmed.p1")}</Dialog.Content>
      <Dialog.Footer>
        <Button type="submit" styleType={AppearanceStyleType.primary} onClick={onClose}>
          {t("t.ok")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}

export const NewAccountNotConfirmedModal = ({
  email,
  onClose,
}: {
  email: string
  onClose: () => void
}) => {
  const [emailSent, setEmailSent] = useState(false)
  const [emailSentError, setEmailSentError] = useState<string | null>(null)
  const requestEmail = () => {
    confirmEmail(email)
      .then(() => {
        setEmailSent(true)
      })
      .catch(() => {
        setEmailSentError(t("signIn.newAccount.sendEmailAgainButton.error"))
      })
  }

  return (
    <Dialog isOpen={!!email} onClose={onClose}>
      <Dialog.Header>{t("signIn.newAccount.title")}</Dialog.Header>
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
      <Dialog.Content>{t("signIn.newAccount.p1", { email })}</Dialog.Content>
      <Dialog.Content>{t("signIn.newAccount.p2")}</Dialog.Content>
      <Dialog.Footer>
        <Button type="submit" styleType={AppearanceStyleType.primary} onClick={onClose}>
          {t("t.ok")}
        </Button>
        <Button styleType={AppearanceStyleType.secondary} onClick={requestEmail}>
          {t("signIn.newAccount.sendEmailAgainButton")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
