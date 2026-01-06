import React from "react"
import { t, LoadingOverlay } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./invite-to-apply.module.scss"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import FormLayout from "../../layouts/FormLayout"
import InviteToApplyLeasingAgentInfo from "./InviteToApplyLeasingAgentInfo"
import InviteToApplyHeader from "./InviteToApplyHeader"

interface InviteToApplyDeadlinePassedProps {
  listing: RailsSaleListing | null
}

const InviteToApplyDeadlinePassed = ({ listing }: InviteToApplyDeadlinePassedProps) => {
  return (
    <FormLayout>
      <LoadingOverlay isLoading={!listing}>
        <InviteToApplyHeader listing={listing} />
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
              {t("inviteToApplyPage.deadlinePassed.p1", {
                listingName: listing?.Building_Name_for_Process,
              })}
            </Heading>
            <InviteToApplyLeasingAgentInfo listing={listing} />
          </Card.Section>
        </Card>
      </LoadingOverlay>
    </FormLayout>
  )
}

export default InviteToApplyDeadlinePassed
