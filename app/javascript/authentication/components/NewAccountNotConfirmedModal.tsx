import { t, Button, AppearanceStyleType } from "@bloom-housing/ui-components"
import { Dialog } from "@bloom-housing/ui-seeds"
import React, { useState } from "react"
import { EmailBanners, requestEmail } from "./EmailBanners"

export const NewAccountNotConfirmedModal = ({
  email,
  onClose,
}: {
  email: string
  onClose: () => void
}) => {
  const [emailSent, setEmailSent] = useState(false)
  const [emailSentError, setEmailSentError] = useState<string | null>(null)

  return (
    <Dialog isOpen={!!email} onClose={onClose}>
      <Dialog.Header>{t("signIn.newAccount.title")}</Dialog.Header>
      <EmailBanners emailSent={emailSent} emailSentError={emailSentError} />
      <Dialog.Content>{t("signIn.newAccount.p1", { email })}</Dialog.Content>
      <Dialog.Content>{t("signIn.newAccount.p2")}</Dialog.Content>
      <Dialog.Footer>
        <Button type="submit" styleType={AppearanceStyleType.primary} onClick={onClose}>
          {t("t.ok")}
        </Button>
        <Button
          styleType={AppearanceStyleType.secondary}
          onClick={() => requestEmail(email, setEmailSent, setEmailSentError)}
        >
          {t("signIn.newAccount.sendEmailAgainButton")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
