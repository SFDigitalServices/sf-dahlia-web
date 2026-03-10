import React from "react"
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons"
import { t, Icon } from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Button } from "@bloom-housing/ui-seeds/"
import styles from "./ListingApplyStepErrorMessage.module.scss"

interface ListingApplyStepErrorMessageProps {
  errorMessage: string
  errorNote?: string
  onClose: () => void
}

const ListingApplyStepErrorMessage = ({
  errorMessage,
  errorNote,
  onClose,
}: ListingApplyStepErrorMessageProps) => {
  return (
    <CardSection className={styles["error-section"]}>
      <div className={styles["error-message"]}>
        <div>
          <Icon symbol={faTriangleExclamation} size="medium" />
        </div>
        <p>{errorMessage}</p>
        <div>
          <Button variant="text" onClick={onClose} ariaLabel={t("t.close")}>
            <Icon symbol={faXmark} size="medium" />
          </Button>
        </div>
      </div>
      {errorNote && <div className={styles["error-note"]}>{errorNote}</div>}
    </CardSection>
  )
}

export default ListingApplyStepErrorMessage
