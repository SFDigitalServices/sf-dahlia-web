import { AppearanceStyleType, Button, t } from "@bloom-housing/ui-components"
import React from "react"
import { Dialog } from "@bloom-housing/ui-seeds"

const AccountAlreadyConfirmedModal = ({
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

export { AccountAlreadyConfirmedModal as default, AccountAlreadyConfirmedModal }
