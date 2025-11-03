import React from "react"
import { t, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./InviteToApplyDeadlinePassed.module.scss"

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
    <Card className={styles.deadlinePassedCard}>
      <Card.Header className={styles.deadlinePassedHeader} divider="flush"> 
        <Heading priority={2} size="2xl" className={styles.deadlinePassedHeading}>
          {t("inviteToApplyPage.deadlinePassed.title")}
        </Heading>
        <p>{t("inviteToApplyPage.deadlinePassed.subtitle")}</p>
      </Card.Header>
      <Card.Section className={styles.deadlinePassedSection}>
        <Heading priority={3} size="xl" className={styles.deadlinePassedHeading}>
          {t("inviteToApplyPage.deadlinePassed.p1", { listingName })}
        </Heading>
        <p>{leasingAgentName}</p>
        <p className="field-note">{t("inviteToApplyPage.deadlinePassed.p2")}</p>
        <a className={styles.deadlinePassedIcon} href={`tel:+1${leasingAgentPhone}`}>
          <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
          {leasingAgentPhone}
        </a>
        <a className={styles.deadlinePassedIcon} href={`mailto:${leasingAgentEmail}`}>
          <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
          {leasingAgentEmail}
        </a>
      </Card.Section>
    </Card>
  )
}

export default InviteToApplyDeadlinePassed
