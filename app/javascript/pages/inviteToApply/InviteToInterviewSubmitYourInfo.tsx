import React from "react"
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
  localizedFormat,
} from "../../util/languageUtil"
import styles from "./invite-to-apply.module.scss"
import Layout from "../../layouts/Layout"
import { ConfigContext } from "../../lib/ConfigContext"
import InviteToApplyLeasingAgentInfo from "./InviteToApplyLeasingAgentInfo"
import { HOME_SF_PHONE } from "../../modules/constants"

interface InviteToInterviewSubmitYourInfoProps {
  listing: RailsSaleListing | null
  deadline: string
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
          ? t("inviteToInterviewPage.submitYourInfo.deadlinePassed")
          : t("inviteToInterviewPage.submitYourInfo.scheduleByDeadline")}
      </strong>
      <span>
        {t("inviteToInterviewPage.submitYourInfo.deadline", {
          day: localizedFormat(deadline, "ll"),
        })}
      </span>
    </Message>
  )
}

const PreparingYourApplication = () => {
  return (
    <div className={styles.submitYourInfoSection}>
      <div className={styles.submitYourInfoBox}>
        <Heading priority={3} size="lg">
          {t("inviteToInterviewPage.submitYourInfo.prepare.title")}
        </Heading>
        <p>{t("inviteToInterviewPage.submitYourInfo.prepare.p1")}</p>
        {renderInlineMarkup(t("inviteToInterviewPage.submitYourInfo.prepare.p2"))}
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
    </div>
  )
}

const WhatToDo = ({
  listing,
  deadline,
}: {
  listing: RailsSaleListing
  deadline: string
}) => {
  return (
    <div className={styles.whatToDoList}>
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
              onClick={() => {
                // TODO: Replace with dedicated scheduling URL field once available in Salesforce
                const url = listing?.File_Upload_URL
                console.warn("Using the File_Upload_URL field for this listing. A dedicated schedule interview Salesforce field is needed.")
                window.open(url, "_blank")
              }}
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
                `/${getCurrentLanguage()}/listings/${listing?.Id}/invite-to-interview/documents`,
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
      {isDeadlinePassed(deadline) && (
        <Message
          variant="secondary"
          fullwidth
          customIcon={<Icon symbol="clock" size="medium" />}
          testId="deadline-passed-banner"
        >
          {renderInlineMarkup(
            t("inviteToInterviewPage.submitYourInfo.deadlineInfo", {
              day: localizedFormat(deadline, "ll"),
              listingName: listing?.Building_Name_for_Process,
            })
          )}
        </Message>
      )}
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
        {t("inviteToInterviewPage.submitYourInfo.seeApartment")}
      </a>
    </div>
  )
}

const SubmitYourInfoSidebarBlock = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <SidebarBlock title={t("contactAgent.contact")} priority={2}>
      <Heading size="lg" priority={3}>
        {t("inviteToInterviewPage.submitYourInfo.sidebar")}
      </Heading>
      <InviteToApplyLeasingAgentInfo listing={listing} />
      <Heading size="sm" priority={3}>
        {t("contactAgent.officeHours.seeTheUnit")}
      </Heading>
      <p>{getTranslatedString(listing?.Office_Hours, "Office_Hours__c", listing?.translations)}</p>
    </SidebarBlock>
  )
}

const InviteToInterviewSubmitYourInfo = ({
  listing,
  deadline,
}: InviteToInterviewSubmitYourInfoProps) => {
  const { getAssetPath } = React.useContext(ConfigContext)
  const titleName = listing?.Building_Name_for_Process || listing?.Name
  return (
    <Layout>
      <PageHeader
        title={titleName}
        subtitle={t("inviteToInterviewPage.submitYourInfo.subtitle")}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      <div className={styles.submitYourInfo}>
        <div className={styles.submitYourInfoPage}>
          <main className={styles.submitYourInfoMain}>
            <SubmitYourInfoHeader listing={listing} />
            <DeadlineBanner deadline={deadline} />
            <WhatToDo listing={listing} deadline={deadline} />
            <PreparingYourApplication />
            <Mobile>
              <Heading size="lg" priority={3}>
                {t("inviteToInterviewPage.submitYourInfo.sidebar")}
              </Heading>
              <InviteToApplyLeasingAgentInfo listing={listing} />
            </Mobile>
            <WhatToExpectAfter />
            <Button
              leadIcon={<Icon symbol={faPrint} size="medium" fill={IconFillColors.primary} />}
              variant="primary-outlined"
              onClick={() => window.print()}
              className={styles.actionButton}
              nativeButtonProps={{ style: { width: "fit-content" } }}
            >
              {t("inviteToInterviewPage.submitYourInfo.printThisPage")}
            </Button>
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

export default InviteToInterviewSubmitYourInfo
