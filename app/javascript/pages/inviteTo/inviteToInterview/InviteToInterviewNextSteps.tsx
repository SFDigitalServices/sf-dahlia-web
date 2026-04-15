import React from "react"
import { faPrint } from "@fortawesome/free-solid-svg-icons"
import { Icon, IconFillColors, Mobile, t } from "@bloom-housing/ui-components"
import { Heading, Button } from "@bloom-housing/ui-seeds"
import RailsSaleListing from "../../../api/types/rails/listings/RailsSaleListing"
import { isDeadlinePassed } from "../../../util/listingUtil"
import { getCurrentLanguage } from "../../../util/languageUtil"
import styles from "../invite-to.module.scss"
import { ConfigContext } from "../../../lib/ConfigContext"
import InviteToLayout from "../InviteToLayout"
import InviteToGetHelp from "../InviteToGetHelp"
import InviteToLeasingAgentInfo from "../InviteToLeasingAgentInfo"

interface InviteToInterviewNextStepsProps {
  listing: RailsSaleListing
  deadline: string
}

const WhatToDo = ({ listing, deadline }: { listing: RailsSaleListing; deadline: string }) => {
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
            <Button
              className={styles.actionButton}
              onClick={() => window.open(listing?.Leaseup_Appointment_Scheduling_URL, "_blank")}
            >
              {t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.p2")}
            </Button>
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

const InviteToInterviewNextSteps = ({ listing, deadline }: InviteToInterviewNextStepsProps) => {
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
      <WhatToDo listing={listing} deadline={deadline} />
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
        nativeButtonProps={{ style: { width: "fit-content" } }}
      >
        {t("inviteToInterviewPage.submitYourInfo.printThisPage")}
      </Button>
    </InviteToLayout>
  )
}

export default InviteToInterviewNextSteps
