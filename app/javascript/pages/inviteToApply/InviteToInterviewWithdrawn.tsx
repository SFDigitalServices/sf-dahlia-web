import React from "react"
import { t, LoadingOverlay } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./invite-to-apply.module.scss"
import { renderMarkup, localizedFormat } from "../../util/languageUtil"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import FormLayout from "../../layouts/FormLayout"
import InviteToApplyHeader from "./InviteToApplyHeader"
import InviteToApplyLeasingAgentInfo from "./InviteToApplyLeasingAgentInfo"
import { isDeadlinePassed } from "../../util/listingUtil"

interface InviteToInterviewWithdrawnProps {
  listing: RailsSaleListing | null
  deadline: string
  submitPreviewLink: string
}

const InviteToInterviewWithdrawn = ({
  listing,
  deadline,
  submitPreviewLink,
}: InviteToInterviewWithdrawnProps) => {
  return (
    <FormLayout>
      <LoadingOverlay isLoading={!listing}>
        <InviteToApplyHeader listing={listing} />
        <Card className={styles.responseCard}>
          <Card.Header className={styles.responseHeader} divider="flush">
            <Heading priority={2} size="2xl" className={styles.responseHeading}>
              {t("inviteToInterviewPage.withdrawn.title")}
            </Heading>
          </Card.Header>
          {!isDeadlinePassed(deadline) && (
            <Card.Section className={styles.responseSection}>
              <Heading priority={3} size="xl" className={styles.responseHeading}>
                {t("inviteToInterviewPage.leasingAgent.p1")}
              </Heading>
              <p>{t("inviteToInterviewPage.leasingAgent.p2")}</p>
              <p>{t("inviteToInterviewPage.leasingAgent.p3")}</p>
              <InviteToApplyLeasingAgentInfo listing={listing} />
              {renderMarkup(
                `${t("inviteToInterviewPage.withdrawn.body", {
                  listingName: listing?.Building_Name_for_Process,
                  link: submitPreviewLink,
                  deadline: localizedFormat(deadline, "ll"),
                })}`,
                "<strong></strong><a></a>"
              )}
            </Card.Section>
          )}
        </Card>
      </LoadingOverlay>
    </FormLayout>
  )
}

export default InviteToInterviewWithdrawn
