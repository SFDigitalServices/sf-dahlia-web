import { t, Button } from "@bloom-housing/ui-components"
import { Dialog, Link } from "@bloom-housing/ui-seeds"
import React from "react"
import { Application } from "../../../api/types/rails/application/RailsApplication"
import { convertToReadableDate } from "../../../util/listingUtil"
import { getApplicationPath } from "../../../util/routeUtil"

export const AlreadySubmittedModal: React.FC<{
  alreadySubmittedId: string | null
  onClose: () => void
  alreadySubmittedApplication?: Application
}> = ({ alreadySubmittedId, onClose, alreadySubmittedApplication }) => {
  if (!alreadySubmittedId || !alreadySubmittedApplication) {
    return null
  }

  const applicationSubmittedDate = convertToReadableDate(
    alreadySubmittedApplication.applicationSubmittedDate
  )

  return (
    <Dialog isOpen={!!alreadySubmittedId} onClose={onClose}>
      <Dialog.Header>{t("alreadySubmitted.title")}</Dialog.Header>
      <Dialog.Content>{t("alreadySubmitted.message")}</Dialog.Content>
      <Dialog.Content>
        {t("alreadySubmitted.date", { date: applicationSubmittedDate })}
      </Dialog.Content>
      <Dialog.Footer>
        <Link href={`${getApplicationPath()}/${alreadySubmittedId}`}>
          <Button>{t("label.viewApplication")}</Button>
        </Link>
      </Dialog.Footer>
    </Dialog>
  )
}
