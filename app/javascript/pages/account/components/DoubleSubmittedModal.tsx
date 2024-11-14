import { t } from "@bloom-housing/ui-components"
import { Dialog } from "@bloom-housing/ui-seeds"
import React from "react"
import { renderInlineMarkup } from "../../../util/languageUtil"

export const DoubleSubmittedModal: React.FC<{
  openModal: boolean
  onClose: () => void
}> = ({ openModal, onClose }) => {
  return (
    <Dialog isOpen={openModal} onClose={onClose}>
      <Dialog.Header>{t("doubleSubmitted.title")}</Dialog.Header>
      <Dialog.Content>{t("doubleSubmitted.p1")}</Dialog.Content>
      <Dialog.Content>
        {renderInlineMarkup(
          t("doubleSubmitted.p2", {
            email:
              "<a href='mailto:dahliahousingportal@sfgov.org'>dahliahousingportal@sfgov.org</a>",
          })
        )}
      </Dialog.Content>
    </Dialog>
  )
}
