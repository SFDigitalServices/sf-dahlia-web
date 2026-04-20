import React, { useCallback, useState } from "react"
import { faPrint } from "@fortawesome/free-solid-svg-icons"
import { t, Icon, IconFillColors, Mobile } from "@bloom-housing/ui-components"
import { Heading, Button, Message, LoadingState } from "@bloom-housing/ui-seeds"
import RailsSaleListing from "../../../api/types/rails/listings/RailsSaleListing"
import { isDeadlinePassed } from "../../../util/listingUtil"
import {
  renderInlineMarkup,
  getCurrentLanguage,
  getBMRApplicationUrl,
  localizedFormat,
} from "../../../util/languageUtil"
import styles from "../invite-to.module.scss"
import { ConfigContext } from "../../../lib/ConfigContext"
import InviteToLayout from "../InviteToLayout"
import { recordResponse } from "../../../api/inviteToApiService"
import InviteToGetHelp from "../InviteToGetHelp"
import InviteToLeasingAgentInfo from "../InviteToLeasingAgentInfo"

interface InviteToApplyNextStepsProps {
  listing: RailsSaleListing | null
  deadline: string
  appId?: string
  fileUploadUrl?: string
}

const PreparingYourApplication = () => {
  return (
    <div className={styles.submitYourInfoSection}>
      <Heading priority={2} size="2xl">
        {t("howToApplyPage.howLongItTakesSection.subtitle1")}
      </Heading>
      <p>{t("inviteToApplyPage.submitYourInfo.prepare.p1")}</p>
      <InviteToGetHelp />
      <Button
        leadIcon={<Icon symbol={faPrint} size="medium" fill={IconFillColors.primary} />}
        variant="primary-outlined"
        onClick={() => window.print()}
        className={styles.actionButton}
      >
        {t("inviteToApplyPage.submitYourInfo.prepare.p5")}
      </Button>
    </div>
  )
}

const WhatToDo = ({
  listing,
  deadline,
  appId,
  fileUploadUrl,
}: {
  listing: RailsSaleListing
  deadline: string
  appId?: string
  fileUploadUrl?: string
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmitClick = useCallback(() => {
    const url = fileUploadUrl || listing?.File_Upload_URL
    // Handle the API call and open URL
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
            type: "I2A",
          })
        }
        setIsSubmitting(false)
      } catch (error) {
        console.error("Error submitting invite to apply response:", error)
        // Still open the file upload URL even if API call fails
        window.open(url, "_blank")
        setIsSubmitting(false)
      }
    })()
  }, [appId, listing, deadline, fileUploadUrl])

  return (
    <div className={styles.whatToDoList}>
      <Heading priority={2} size="2xl">
        {t("inviteToApplyPage.submitYourInfo.whatToDo.title")}
      </Heading>
      <ol className={`${styles.numberedList} numbered-list`}>
        <li>
          <Heading priority={3} size="lg">
            {t("inviteToApplyPage.submitYourInfo.whatToDo.step1.title")}
          </Heading>
          {renderInlineMarkup(
            t("inviteToApplyPage.submitYourInfo.whatToDo.step1.p1"),
            "<strong></strong>"
          )}
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step1.p2")}</p>
          <Button
            className={styles.actionButton}
            variant="primary-outlined"
            onClick={() => window.open(getBMRApplicationUrl(), "_blank")}
          >
            {t("inviteToApplyPage.submitYourInfo.whatToDo.step1.p3")}
          </Button>
        </li>
        <li>
          <Heading priority={3} size="lg">
            {t("inviteToApplyPage.submitYourInfo.whatToDo.step2.title")}
          </Heading>
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step2.p1")}</p>
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step2.p2")}</p>
          {renderInlineMarkup(
            t("inviteToApplyPage.submitYourInfo.whatToDo.step2.p3", {
              link: `/${getCurrentLanguage()}/listings/${listing?.Id}/invite-to-apply/documents`,
            })
          )}
        </li>
        <li>
          <Heading priority={3} size="lg">
            {t("inviteToApplyPage.submitYourInfo.whatToDo.step3.title")}
          </Heading>
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p1")}</p>
          <ul className={styles.submitYourInfoList}>
            <li>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p2")}</li>
            <li>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p3")}</li>
          </ul>
          {!isDeadlinePassed(deadline) && (
            <LoadingState loading={isSubmitting} className={styles.loadingOverlay}>
              <Button className={styles.actionButton} onClick={handleSubmitClick}>
                {t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p4")}
              </Button>
            </LoadingState>
          )}
          <Heading priority={3} size="lg">
            {t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p5")}
          </Heading>
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p6")}</p>
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p7")}</p>
        </li>
      </ol>
      {isDeadlinePassed(deadline) && (
        <Message
          variant="secondary"
          fullwidth
          customIcon={<Icon symbol="clock" size="medium" />}
          testId="deadline-passed-banner"
        >
          {renderInlineMarkup(
            t("inviteToApplyPage.submitYourInfo.deadlineInfo", {
              day: localizedFormat(deadline, "ll"),
              listingName: listing?.Building_Name_for_Process,
            })
          )}
        </Message>
      )}
      <div className={styles.submitYourInfoBox}>
        <Heading priority={4} size="lg">
          {t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p8")}
        </Heading>
        <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p9")}</p>
      </div>
    </div>
  )
}

const WhatHappensNext = () => {
  return (
    <div className={styles.submitYourInfoSection}>
      <Heading priority={2} size="2xl">
        {t("howToApplyPage.whatHappensNext.title")}
      </Heading>
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.submitYourInfo.whatHappensNext.p1")}
      </Heading>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p2")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p3")}</p>
      <ul className={styles.submitYourInfoList}>
        <li>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p4")}</li>
        <li>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p5")}</li>
      </ul>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p6")}</p>
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.submitYourInfo.whatHappensNext.p7")}
      </Heading>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p8")}</p>
    </div>
  )
}

const InviteToApplyNextSteps = ({
  listing,
  deadline,
  appId,
  fileUploadUrl,
}: InviteToApplyNextStepsProps) => {
  const { getAssetPath } = React.useContext(ConfigContext)
  const titleName = listing?.Building_Name_for_Process || listing?.Name
  return (
    <InviteToLayout
      listing={listing}
      type="I2A"
      title={t("inviteToApplyPage.submitYourInfo.title", { listingName: titleName })}
      headerText="inviteToApplyPage.submitYourInfo.p1"
      sidebarText="inviteToApplyPage.submitYourInfo.sidebar"
      getAssetPath={getAssetPath}
      deadline={deadline}
    >
      <PreparingYourApplication />
      <WhatToDo listing={listing} deadline={deadline} appId={appId} fileUploadUrl={fileUploadUrl} />
      <Mobile>
        <Heading size="lg" priority={3}>
          {t("inviteToApplyPage.submitYourInfo.sidebar")}
        </Heading>
        <InviteToLeasingAgentInfo listing={listing} />
      </Mobile>
      <WhatHappensNext />
    </InviteToLayout>
  )
}

export default InviteToApplyNextSteps
