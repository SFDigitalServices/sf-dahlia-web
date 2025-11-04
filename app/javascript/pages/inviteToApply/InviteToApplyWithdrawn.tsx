import React from "react"
import { t, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./InviteToApplyResponse.module.scss"
import { renderMarkup } from "../../util/languageUtil"

interface InviteToApplyWithdrawnProps {
  listingName: string
  leasingAgentName: string
  leasingAgentPhone: string
  leasingAgentEmail: string
  formattedDeadline: string
  submitLink: string
}

const InviteToApplyWithdrawn = ({
  listingName,
  leasingAgentName,
  leasingAgentPhone,
  leasingAgentEmail,
  formattedDeadline,
  submitLink,
}: InviteToApplyWithdrawnProps) => {
  return (
    <Card className={styles.responseCard}>
      <Card.Header className={styles.responseHeader} divider="flush">
        <Heading priority={2} size="2xl" className={styles.responseHeading}>
          {t("inviteToApplyPage.withdrawn.title")}
        </Heading>
      </Card.Header>
      <Card.Section className={styles.responseSection}>
        <Heading priority={3} size="xl" className={styles.responseHeading}>
          {t("inviteToApplyPage.withdrawn.p1")}
        </Heading>
        <p>{t("inviteToApplyPage.withdrawn.p2")}</p>
        <p>{t("inviteToApplyPage.withdrawn.p3")}</p>
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
        {renderMarkup(
          `${t("inviteToApplyPage.withdrawn.footer", {
            listingName: listingName,
            link: submitLink,
            deadline: formattedDeadline,
          })}`,
          "<strong></strong><a></a>"
        )}
      </Card.Section>
    </Card>
  )
}

export default InviteToApplyWithdrawn
