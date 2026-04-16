import React from "react"
import { t, LoadingOverlay } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./invite-to.module.scss"
import { renderMarkup, localizedFormat } from "../../util/languageUtil"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import FormLayout from "../../layouts/FormLayout"
import InviteToApplyHeader from "./InviteToHeader"
import InviteToApplyLeasingAgentInfo from "./InviteToLeasingAgentInfo"
import { INVITE_TO_X } from "../../modules/constants"

interface InviteToContactMeLaterProps {
  type: INVITE_TO_X
  listing: RailsSaleListing | null
  deadline: string
  submitPreviewLink: string
}

const InviteToContactMeLater = ({
  type,
  listing,
  deadline,
  submitPreviewLink,
}: InviteToContactMeLaterProps) => {
  return (
    <FormLayout>
      <LoadingOverlay isLoading={!listing}>
        <InviteToApplyHeader listing={listing} />
        <Card className={styles.responseCard}>
          <Card.Header className={styles.responseHeader} divider="flush">
            <Heading priority={2} size="2xl" className={styles.responseHeading}>
              {type === INVITE_TO_X.APPLY
                ? t("inviteToApplyPage.contact.title", {
                    listingName: listing?.Building_Name_for_Process,
                  })
                : t("inviteToInterviewPage.waitlist.title")}
            </Heading>
            <p className={styles.responseSubtitle}>
              {type === INVITE_TO_X.APPLY && t("inviteToApplyPage.contact.subtitle")}
              {type === INVITE_TO_X.INTERVIEW &&
                renderMarkup(
                  `${t("inviteToInterviewPage.waitlist.subtitle", {
                    listingName: listing?.Building_Name_for_Process,
                    link: `/listings/${listing?.Id}`,
                  })}\n\n${t("inviteToInterviewPage.waitlist.p1")}`,
                  "<strong></strong><a></a>"
                )}
            </p>
          </Card.Header>
          <Card.Section className={styles.responseSection}>
            <Heading priority={3} size="xl" className={styles.responseHeading}>
              {t("inviteToApplyPage.leasingAgent.p1")}
            </Heading>
            <p>{t("inviteToApplyPage.leasingAgent.p2")}</p>
            <p>{t("inviteToApplyPage.leasingAgent.p3")}</p>
            <InviteToApplyLeasingAgentInfo listing={listing} />
            {type === INVITE_TO_X.APPLY &&
              renderMarkup(
                t("inviteToApplyPage.submitYourInfo", {
                  listingName: listing?.Building_Name_for_Process,
                  link: submitPreviewLink,
                  deadline: localizedFormat(deadline, "ll"),
                }),
                "<strong></strong><a></a>"
              )}
            {type === INVITE_TO_X.INTERVIEW &&
              renderMarkup(
                t("inviteToInterviewPage.waitlist.body", {
                  listingName: listing?.Building_Name_for_Process,
                  link: submitPreviewLink,
                  deadline: localizedFormat(deadline, "ll"),
                }),
                "<strong></strong><a></a>"
              )}
          </Card.Section>
        </Card>
      </LoadingOverlay>
    </FormLayout>
  )
}

export default InviteToContactMeLater
