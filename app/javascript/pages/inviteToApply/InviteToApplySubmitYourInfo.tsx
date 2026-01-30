import React, { useCallback } from "react"
import { faEnvelope, faPrint } from "@fortawesome/free-solid-svg-icons"
import {
  t,
  Icon,
  IconFillColors,
  SidebarBlock,
  PageHeader,
  Mobile,
  Desktop,
} from "@bloom-housing/ui-components"
import { Heading, Button, Message } from "@bloom-housing/ui-seeds"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getListingAddressString, isDeadlinePassed } from "../../util/listingUtil"
import {
  getTranslatedString,
  renderInlineMarkup,
  getCurrentLanguage,
  getBMRApplicationUrl,
  localizedFormat,
} from "../../util/languageUtil"
import styles from "./invite-to-apply.module.scss"
import Layout from "../../layouts/Layout"
import { ConfigContext } from "../../lib/ConfigContext"
import InviteToApplyLeasingAgentInfo from "./InviteToApplyLeasingAgentInfo"
import { HOME_SF_PHONE } from "../../modules/constants"
import { recordResponse } from "../../api/inviteToApplyApiService"

interface InviteToApplySubmitYourInfoProps {
  listing: RailsSaleListing | null
  deadline: string
  applicationNumber?: string
  fileUploadUrl?: string
}

const DeadlineBanner = ({ deadline }: { deadline: string }) => {
  return (
    <Message
      fullwidth
      variant={isDeadlinePassed(deadline) ? "alert" : "warn"}
      customIcon={<Icon symbol="clock" size="medium" />}
    >
      <strong>
        {isDeadlinePassed(deadline)
          ? t("inviteToApplyPage.submitYourInfo.deadlinePassed")
          : t("inviteToApplyPage.submitYourInfo.submitByDeadline")}
      </strong>
      <span>
        {t("inviteToApplyPage.submitYourInfo.deadline", { day: localizedFormat(deadline, "ll") })}
      </span>
    </Message>
  )
}

const PreparingYourApplication = () => {
  return (
    <div className={styles.submitYourInfoSection}>
      <Heading priority={2} size="2xl">
        {t("howToApplyPage.howLongItTakesSection.subtitle1")}
      </Heading>
      <p>{t("inviteToApplyPage.submitYourInfo.prepare.p1")}</p>
      <div className={styles.submitYourInfoBox}>
        <Heading priority={3} size="lg">
          {t("inviteToApplyPage.submitYourInfo.prepare.p2")}
        </Heading>
        <p>{t("inviteToApplyPage.submitYourInfo.prepare.p3")}</p>
        {renderInlineMarkup(t("inviteToApplyPage.submitYourInfo.prepare.p4"))}
        <span className={styles.submitYourInfoIcons}>
          <a className={styles.responseIcon} href={`tel:+1${HOME_SF_PHONE}`}>
            <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
            {HOME_SF_PHONE}
          </a>
          <a className={styles.responseIcon} href={`mailto:${"info@homesanfrancisco.org"}`}>
            <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
            {"info@homesanfrancisco.org"}
          </a>
        </span>
      </div>
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
  applicationNumber,
  fileUploadUrl,
}: {
  listing: RailsSaleListing
  deadline: string
  applicationNumber?: string
  fileUploadUrl?: string
}) => {
  const handleSubmitClick = useCallback(() => {
    const url = fileUploadUrl || listing?.File_Upload_URL
    // Handle the API call and open URL
    void (async () => {
      try {
        // Call the API if applicationNumber is provided
        if (applicationNumber) {
          await recordResponse({
            applicationNumber,
            listingId: listing.Id,
            deadline,
            response: "submit",
          })
        }
        // Open the file upload URL after API call (or directly if no applicationNumber)
        window.open(url, "_blank")
      } catch (error) {
        console.error("Error submitting invite to apply response:", error)
        // Still open the file upload URL even if API call fails
        window.open(url, "_blank")
      }
    })()
  }, [applicationNumber, listing, deadline, fileUploadUrl])

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
            <Button className={styles.actionButton} onClick={handleSubmitClick}>
              {t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p4")}
            </Button>
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

const SubmitYourInfoHeader = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <div className={styles.submitYourInfoSection}>
      <img
        src={listing?.Listing_Images?.[0]?.Image_URL}
        alt={listing?.Listing_Images?.[0]?.Image_Description}
      />
      <strong>{listing?.Building_Name_for_Process}</strong>
      <p>{listing && getListingAddressString(listing, false)}</p>
      <a href={`/${getCurrentLanguage()}/listings/${listing?.Id}`}>
        {t("inviteToApplyPage.submitYourInfo.p1")}
      </a>
    </div>
  )
}

const SubmitYourInfoSidebarBlock = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <SidebarBlock title={t("contactAgent.contact")} priority={2}>
      <Heading size="lg" priority={3}>
        {" "}
        {t("inviteToApplyPage.submitYourInfo.sidebar")}
      </Heading>
      <InviteToApplyLeasingAgentInfo listing={listing} />
      <Heading size="sm" priority={3}>
        {t("contactAgent.officeHours.seeTheUnit")}
      </Heading>
      <p>{getTranslatedString(listing?.Office_Hours, "Office_Hours__c", listing?.translations)}</p>
    </SidebarBlock>
  )
}

const InviteToApplySubmitYourInfo = ({
  listing,
  deadline,
  applicationNumber,
  fileUploadUrl,
}: InviteToApplySubmitYourInfoProps) => {
  const { getAssetPath } = React.useContext(ConfigContext)
  const titleName = listing?.Building_Name_for_Process || listing?.Name
  return (
    <Layout>
      <PageHeader
        title={t("inviteToApplyPage.submitYourInfo.title", { listingName: titleName })}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      <div className={styles.submitYourInfo}>
        <div className={styles.submitYourInfoPage}>
          <main className={styles.submitYourInfoMain}>
            <SubmitYourInfoHeader listing={listing} />
            <DeadlineBanner deadline={deadline} />
            <PreparingYourApplication />
            <WhatToDo
              listing={listing}
              deadline={deadline}
              applicationNumber={applicationNumber}
              fileUploadUrl={fileUploadUrl}
            />
            <Mobile>
              <Heading size="lg" priority={3}>
                {t("inviteToApplyPage.submitYourInfo.sidebar")}
              </Heading>
              <InviteToApplyLeasingAgentInfo listing={listing} />
            </Mobile>
            <WhatHappensNext />
          </main>
          <Desktop>
            <aside className={styles.submitYourInfoSidebar}>
              <SubmitYourInfoSidebarBlock listing={listing} />
            </aside>
          </Desktop>
        </div>
      </div>
    </Layout>
  )
}

export default InviteToApplySubmitYourInfo
