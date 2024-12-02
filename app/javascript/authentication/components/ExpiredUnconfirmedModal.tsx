import { t, Button, AppearanceStyleType } from "@bloom-housing/ui-components"
import { Dialog } from "@bloom-housing/ui-seeds"
import React, { useState } from "react"
import { EmailBanners, requestEmail } from "./EmailBanners"

export const ExpiredUnconfirmedModal = ({
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
      <Dialog.Header>{t("signIn.expiredUnconfirmed.title")}</Dialog.Header>
      <EmailBanners emailSent={emailSent} emailSentError={emailSentError} />
      <Dialog.Content>{t("signIn.expiredUnconfirmed.p1")}</Dialog.Content>
      <Dialog.Content>{t("signIn.expiredUnconfirmed.p2")}</Dialog.Content>
      <Dialog.Footer>
        <Button
          type="submit"
          styleType={AppearanceStyleType.primary}
          onClick={() => requestEmail(email, setEmailSent, setEmailSentError)}
        >
          {t("signIn.expiredUnconfirmed.sendNewLink")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
