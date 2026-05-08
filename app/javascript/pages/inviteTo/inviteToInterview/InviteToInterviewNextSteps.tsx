import React, { useCallback } from "react"
import { faPrint } from "@fortawesome/free-solid-svg-icons"
import { Icon, IconFillColors, LoadingOverlay, Mobile, t } from "@bloom-housing/ui-components"
import { Heading, Button } from "@bloom-housing/ui-seeds"
import RailsSaleListing from "../../../api/types/rails/listings/RailsSaleListing"
import { isDeadlinePassed } from "../../../util/listingUtil"
import { getCurrentLanguage, getTranslatedString, renderMarkup } from "../../../util/languageUtil"
import styles from "../invite-to.module.scss"
import { ConfigContext } from "../../../lib/ConfigContext"
import InviteToLayout from "../InviteToLayout"
import InviteToGetHelp from "../InviteToGetHelp"
import InviteToLeasingAgentInfo from "../InviteToLeasingAgentInfo"
import { INVITE_TO_X } from "../../../modules/constants"

interface InviteToInterviewNextStepsProps {
  listing: RailsSaleListing
  deadline: string
}

const WhatToDo = ({ listing, deadline }: { listing: RailsSaleListing; deadline: string }) => {
  const handleSubmitClick = useCallback(() => {
    window.open(listing.Leaseup_Appointment_Scheduling_URL, "_blank")
  }, [listing])
  return (
    <div className={`${styles.whatToDoList} markdown`}>
      <Heading priority={2} size="2xl">
        {t("inviteToInterviewPage.submitYourInfo.whatToDo.title")}
      </Heading>
      <ol className="process-list">
        <li>
          <Heading priority={3} size="lg">
            {t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.title")}
          </Heading>
          <p>{t("inviteToInterviewPage.submitYourInfo.whatToDo.step1.p1")}</p>
          {!isDeadlinePassed(deadline) && (
            <Button className={styles.actionButton} onClick={handleSubmitClick}>
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
                `/${getCurrentLanguage()}/listings/${listing.Id}/next-steps/documents?type=I2I`,
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
          {t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.p1")}
          {listing.Fee > 0 && (
            <>
              {t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.p2")}
              {renderMarkup(
                `${t("inviteToInterviewPage.submitYourInfo.whatToDo.step3.p3", { fee: listing.Fee })}`,
                "<strong></strong>"
              )}
            </>
          )}
        </li>
      </ol>
    </div>
  )
}

const WhatToExpectAfter = () => {
  return (
    <div className={styles.infoSubSection}>
      <Heading priority={2} size="2xl">
        {t("inviteToInterviewPage.submitYourInfo.whatToExpect.title")}
      </Heading>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.submitYourInfo.whatToExpect.p1")}
      </Heading>
      <p>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p2")}</p>
      <p>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p3")}</p>
      <ul>
        <li>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p4")}</li>
        <li>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p5")}</li>
      </ul>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.submitYourInfo.whatToExpect.p6")}
      </Heading>
      <p>{t("inviteToInterviewPage.submitYourInfo.whatToExpect.p7")}</p>
      <div className={styles.submitYourInfoBox}>
        <Heading priority={3} size="lg">
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
    <LoadingOverlay isLoading={!listing}>
      <InviteToLayout
        listing={listing}
        type={INVITE_TO_X.INTERVIEW}
        subtitle={t("inviteToInterviewPage.submitYourInfo.subtitle")}
        getAssetPath={getAssetPath}
        headerText="inviteToInterviewPage.submitYourInfo.seeApartment"
        sidebarText="inviteToInterviewPage.submitYourInfo.sidebar"
        deadline={deadline}
      >
        <WhatToDo listing={listing} deadline={deadline} />
        <div className={styles.infoSubSection}>
          <InviteToGetHelp />
          <WhatToExpectAfter />
          <Mobile>
            <Heading size="lg" priority={3}>
              {t("inviteToInterviewPage.submitYourInfo.sidebar")}
            </Heading>
            <InviteToLeasingAgentInfo listing={listing} />
            <Heading size="sm" priority={3}>
              {t("contactAgent.officeHours.seeTheUnit")}
            </Heading>
            <p>
              {getTranslatedString(listing?.Office_Hours, "Office_Hours__c", listing?.translations)}
            </p>
          </Mobile>
          <Button
            leadIcon={<Icon symbol={faPrint} size="medium" fill={IconFillColors.primary} />}
            variant="primary-outlined"
            onClick={() => window.print()}
            className={styles.actionButton}
          >
            {t("inviteToInterviewPage.submitYourInfo.printThisPage")}
          </Button>
        </div>
      </InviteToLayout>
    </LoadingOverlay>
  )
}

export default InviteToInterviewNextSteps
