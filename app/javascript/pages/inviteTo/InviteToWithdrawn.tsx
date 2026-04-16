import React from "react"
import { t, LoadingOverlay } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./invite-to.module.scss"
import { renderMarkup, localizedFormat } from "../../util/languageUtil"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import FormLayout from "../../layouts/FormLayout"
import InviteToApplyHeader from "./InviteToHeader"
import InviteToApplyLeasingAgentInfo from "./InviteToLeasingAgentInfo"
import { isDeadlinePassed } from "../../util/listingUtil"
import { INVITE_TO_X } from "../../modules/constants"

interface InviteToWithdrawnProps {
  type: INVITE_TO_X
  listing: RailsSaleListing | null
  deadline: string
  submitPreviewLink: string
}

const InviteToWithdrawn = ({
  type,
  listing,
  deadline,
  submitPreviewLink,
}: InviteToWithdrawnProps) => {
  return (
    <FormLayout>
      <LoadingOverlay isLoading={!listing}>
        <InviteToApplyHeader listing={listing} />
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
              <InviteToApplyLeasingAgentInfo listing={listing} />
              {type === INVITE_TO_X.APPLY &&
                renderMarkup(
                  `${t("inviteToApplyPage.submitYourInfo", {
                    listingName: listing?.Building_Name_for_Process,
                    link: submitPreviewLink,
                    deadline: localizedFormat(deadline, "ll"),
                  })}`,
                  "<strong></strong><a></a>"
                )}
              {type === INVITE_TO_X.INTERVIEW &&
                renderMarkup(
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

export default InviteToWithdrawn
