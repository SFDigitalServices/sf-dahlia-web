import React from "react"
import { t, LoadingOverlay } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./invite-to-apply.module.scss"
import { renderMarkup, localizedFormat } from "../../util/languageUtil"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { LeasingAgentInfo } from "./invite-to-apply"
import { isDeadlinePassed } from "../../util/listingUtil"

interface InviteToApplyWithdrawnProps {
  listing: RailsSaleListing | null
  deadline: string
  submitLink: string
}

const InviteToApplyWithdrawn = ({ listing, deadline, submitLink }: InviteToApplyWithdrawnProps) => {
  return (
    <LoadingOverlay isLoading={!listing}>
      <Card className={styles.responseCard}>
        <Card.Header className={styles.responseHeader} divider="flush">
          <Heading priority={2} size="2xl" className={styles.responseHeading}>
            {t("inviteToApplyPage.withdrawn.title")}
          </Heading>
        </Card.Header>
        {!isDeadlinePassed(deadline) && (
          <Card.Section className={styles.responseSection}>
            <Heading priority={3} size="xl" className={styles.responseHeading}>
              {t("inviteToApplyPage.leasingAgent.p1")}
            </Heading>
            <p>{t("inviteToApplyPage.leasingAgent.p2")}</p>
            <p>{t("inviteToApplyPage.leasingAgent.p3")}</p>
            <LeasingAgentInfo listing={listing} />
            {renderMarkup(
              `${t("inviteToApplyPage.submitYourInfo", {
                listingName: listing?.Building_Name_for_Process,
                link: submitLink,
                deadline: localizedFormat(deadline, "ll"),
              })}`,
              "<strong></strong><a></a>"
            )}
          </Card.Section>
        )}
      </Card>
    </LoadingOverlay>
  )
}

export default InviteToApplyWithdrawn
