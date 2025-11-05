import React from "react"
import { t, Icon, IconFillColors, LoadingOverlay } from "@bloom-housing/ui-components"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./invite-to-apply.module.scss"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"

interface InviteToApplyDeadlinePassedProps {
  listing: RailsSaleListing | null
}

const InviteToApplyDeadlinePassed = ({ listing }: InviteToApplyDeadlinePassedProps) => {
  return (
    <LoadingOverlay isLoading={!listing}>
      <Card className={styles.responseCard}>
        <Card.Header className={styles.responseHeader} divider="flush">
          <Heading priority={2} size="2xl" className={styles.responseHeading}>
            {t("inviteToApplyPage.deadlinePassed.title")}
          </Heading>
          <p className={styles.responseSubtitle}>
            {t("inviteToApplyPage.deadlinePassed.subtitle")}
          </p>
        </Card.Header>
        <Card.Section className={styles.responseSection}>
          <Heading priority={3} size="xl" className={styles.responseHeading}>
            {t("inviteToApplyPage.deadlinePassed.p1", { listingName: listing?.Name })}
          </Heading>
          <p>{listing?.Leasing_Agent_Name}</p>
          <p className="field-note">{t("inviteToApplyPage.leasingAgent")}</p>
          <a className={styles.responseIcon} href={`tel:+1${listing?.Leasing_Agent_Phone}`}>
            <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
            {listing?.Leasing_Agent_Phone}
          </a>
          <a className={styles.responseIcon} href={`mailto:${listing?.Leasing_Agent_Email}`}>
            <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
            {listing?.Leasing_Agent_Email}
          </a>
        </Card.Section>
      </Card>
    </LoadingOverlay>
  )
}

export default InviteToApplyDeadlinePassed
