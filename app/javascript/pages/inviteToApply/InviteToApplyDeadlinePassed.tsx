import React from "react"
import { t, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./InviteToApplyResponse.module.scss"

interface InviteToApplyDeadlinePassedProps {
  listingName: string
  leasingAgentName: string
  leasingAgentPhone: string
  leasingAgentEmail: string
}

const InviteToApplyDeadlinePassed = ({
  listingName,
  leasingAgentName,
  leasingAgentPhone,
  leasingAgentEmail,
}: InviteToApplyDeadlinePassedProps) => {
  return (
    <Card className={styles.responseCard}>
      <Card.Header className={styles.responseHeader} divider="flush">
        <Heading priority={2} size="2xl" className={styles.responseHeading}>
          {t("inviteToApplyPage.deadlinePassed.title")}
        </Heading>
        <p>{t("inviteToApplyPage.deadlinePassed.subtitle")}</p>
      </Card.Header>
      <Card.Section className={styles.responseSection}>
        <Heading priority={3} size="xl" className={styles.responseHeading}>
          {t("inviteToApplyPage.deadlinePassed.p1", { listingName })}
        </Heading>
        <p>{leasingAgentName}</p>
        <p className="field-note">{t("inviteToApplyPage.leasingAgent")}</p>
        <a className={styles.responseIcon} href={`tel:+1${leasingAgentPhone}`}>
          <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
          {leasingAgentPhone}
        </a>
        <a className={styles.responseIcon} href={`mailto:${leasingAgentEmail}`}>
          <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
          {leasingAgentEmail}
        </a>
      </Card.Section>
    </Card>
  )
}

export default InviteToApplyDeadlinePassed
