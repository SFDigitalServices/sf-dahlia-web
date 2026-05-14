import React from "react"
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { t } from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Button } from "@bloom-housing/ui-seeds"
import styles from "./ListingApplyStepErrorMessage.module.scss"
import { renderInlineMarkup } from "../../../util/languageUtil"

interface ListingApplyStepErrorMessageProps {
  errorMessage: string
  errorNote?: string
  errorNoteHeading?: string
  onClose: () => void
}

const ListingApplyStepErrorMessage = ({
  errorMessage,
  errorNote,
  errorNoteHeading,
  onClose,
}: ListingApplyStepErrorMessageProps) => {
  return (
    <CardSection className={styles["error-section"]}>
      <div className={styles["error-message"]}>
        <div>
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <p>{errorMessage}</p>
        <div>
          <Button variant="text" onClick={onClose} ariaLabel={t("t.close")}>
            <FontAwesomeIcon icon={faXmark} />
          </Button>
        </div>
      </div>
      {errorNote && (
        <div className={styles["error-note"]}>
          {errorNoteHeading && <p>{errorNoteHeading}</p>}
          <br />
          {renderInlineMarkup(errorNote)}
        </div>
      )}
    </CardSection>
  )
}

export default ListingApplyStepErrorMessage
