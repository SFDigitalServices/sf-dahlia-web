import React, { useState, useCallback } from "react"
import { faPrint } from "@fortawesome/free-solid-svg-icons"
import { Icon, IconFillColors, Mobile, t } from "@bloom-housing/ui-components"
import { Heading, Button, LoadingState } from "@bloom-housing/ui-seeds"
import RailsSaleListing from "../../../api/types/rails/listings/RailsSaleListing"
import { isDeadlinePassed } from "../../../util/listingUtil"
import { getCurrentLanguage } from "../../../util/languageUtil"
import styles from "../invite-to.module.scss"
import { ConfigContext } from "../../../lib/ConfigContext"
import InviteToLayout from "../InviteToLayout"
import InviteToGetHelp from "../InviteToGetHelp"
import InviteToLeasingAgentInfo from "../InviteToLeasingAgentInfo"
import { recordResponse } from "../../../api/inviteToApiService"

interface InviteToInterviewNextStepsProps {
  listing: RailsSaleListing
  deadline: string
  appId: string
}

const WhatToDo = ({
  listing,
  deadline,
  appId,
}: {
  listing: RailsSaleListing
  deadline: string
  appId: string
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmitClick = useCallback(() => {
    const url = listing?.Leaseup_Appointment_Scheduling_URL
    void (async () => {
      setIsSubmitting(true)
      window.open(url, "_blank")
      try {
        if (appId) {
          await recordResponse({
            appId: appId,
            applicationNumber: appId,
            listingId: listing.Id,
            deadline,
            action: "submit",
            response: "submit",
            type: "I2I",
          })
        }
        setIsSubmitting(false)
      } catch (error) {
        console.error("Error submitting invite to interview response:", error)
        // Still open the file upload URL even if API call fails
        window.open(url, "_blank")
        setIsSubmitting(false)
      }
    })()
  }, [appId, listing, deadline])
  return (
    <div className={`${styles.infoSubSection} ${styles.whatToDoList}`}>
      <Heading priority={2} size="2xl">
        {t("inviteToInterviewPage.submitYourInfo.whatToDo.title")}
      </Heading>
      <ol className={`${styles.numberedList} numbered-list`}>
        <li>
          <Heading priority={3} size="lg">
            {t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.title")}
          </Heading>
          <p>{t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.p1")}</p>
          {!isDeadlinePassed(deadline) && (
            <LoadingState loading={isSubmitting} className={styles.loadingOverlay}>
              <Button className={styles.actionButton} onClick={handleSubmitClick}>
                {t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.p2")}
              </Button>
            </LoadingState>
          )}
        </li>
        <li>
          <Heading priority={3} size="lg">
            {t("inviteToInterviewPage.submitYourInfo.whatToDo.step2.title")}
          </Heading>
          <p>{t("inviteToInterviewPage.submitYourInfo.whatToDo.step2.p1")}</p>
          <Button
            className={styles.actionButton}
            variant="primary-outlined"
            onClick={() =>
              window.open(
                `/${getCurrentLanguage()}/listings/${listing?.Id}/next-steps/documents`,
                "_blank"
              )
            }
          >
            {t("inviteToInterviewPage.submitYourInfo.whatToDo.step2.p2")}
          </Button>
        </li>
        <li>
          <Heading priority={3} size="lg">
            {t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.title")}
          </Heading>
          <p>{t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.p1")}</p>
          <p>
            <strong>{t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.p2")}</strong>
            {t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.p3")}
          </p>
        </li>
      </ol>
    </div>
  )
}

const WhatToExpectAfter = () => {
  return (
    <div className={styles.submitYourInfoSection}>
      <Heading priority={2} size="2xl">
        {t("inviteToInterviewPage.submitYourInfo.whatToExpect.title")}
      </Heading>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.submitYourInfo.whatToExpect.p1")}
      </Heading>
      <p>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p2")}</p>
      <p>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p3")}</p>
      <ul className={styles.submitYourInfoList}>
        <li>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p4")}</li>
        <li>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p5")}</li>
      </ul>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.submitYourInfo.whatToExpect.p6")}
      </Heading>
      <p>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p7")}</p>
      <div className={styles.submitYourInfoBox}>
        <Heading priority={4} size="lg">
          {t("inviteToInterviewPage.submitYourInfo.whatToExpect.p8")}
        </Heading>
        <p>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p9")}</p>
      </div>
    </div>
  )
}

const InviteToInterviewNextSteps = ({
  listing,
  deadline,
  appId,
}: InviteToInterviewNextStepsProps) => {
  const { getAssetPath } = React.useContext(ConfigContext)
  return (
    <InviteToLayout
      listing={listing}
      type={"I2I"}
      subtitle={t("inviteToInterviewPage.submitYourInfo.subtitle")}
      getAssetPath={getAssetPath}
      headerText="inviteToInterviewPage.submitYourInfo.seeApartment"
      sidebarText="inviteToInterviewPage.submitYourInfo.sidebar"
      deadline={deadline}
    >
      <WhatToDo listing={listing} deadline={deadline} appId={appId} />
      <div className={styles.submitYourInfoSection}>
        <InviteToGetHelp />
      </div>
      <WhatToExpectAfter />
      <Mobile>
        <Heading size="lg" priority={3}>
          {t("inviteToInterviewPage.submitYourInfo.sidebar")}
        </Heading>
        <InviteToLeasingAgentInfo listing={listing} />
      </Mobile>
      <Button
        leadIcon={<Icon symbol={faPrint} size="medium" fill={IconFillColors.primary} />}
        variant="primary-outlined"
        onClick={() => window.print()}
        className={styles.actionButton}
      >
        {t("inviteToInterviewPage.submitYourInfo.printThisPage")}
      </Button>
    </InviteToLayout>
  )
}

export default InviteToInterviewNextSteps
