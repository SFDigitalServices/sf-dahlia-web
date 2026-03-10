import React from "react"
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons"
import { Icon } from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
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
  const handleClick = (event) => {
    event.preventDefault()
    onClose()
  }

  return (
    <CardSection className={styles["error-section"]}>
      <div className={styles["error-message"]}>
        <div>
          <Icon symbol={faTriangleExclamation} size="medium" />
        </div>
        <p>{errorMessage}</p>
        <div>
          <button onClick={handleClick} data-testid="listing-apply-step-error-message-close-button">
            <Icon symbol={faXmark} size="medium" />
          </button>
        </div>
      </div>
      {errorNote && <div className={styles["error-note"]}>{errorNote}</div>}
    </CardSection>
  )
}

export default ListingApplyStepErrorMessage
