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
import { getListingAddressString } from "../../util/listingUtil"
import {
  getApplicationDeadline,
  getTranslatedString,
  renderInlineMarkup,
  getCurrentLanguage,
} from "../../util/languageUtil"
import styles from "./InviteToApply.module.scss"
import Layout from "../../layouts/Layout"
import ConfigContext from "../../lib/ConfigContext"

interface InviteToApplySubmitYourInfoProps {
  listing: RailsSaleListing | null
  deadline: string
}

const DeadlineBanner = ({ deadline }: { deadline: string }) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const isDeadlinePassed = today > deadlineDate
  return (
    <Message
      fullwidth
      variant={isDeadlinePassed ? "alert" : "warn"}
      customIcon={<Icon symbol="clock" size="medium" />}
    >
      <strong>
        {isDeadlinePassed
          ? t("inviteToApplyPage.submitYourInfo.deadlinePassed")
          : t("inviteToApplyPage.submitYourInfo.submitByDeadline")}
      </strong>
      <span>{getApplicationDeadline(deadline)}</span>
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
          <a className={styles.responseIcon} href={`tel:+14152025464`}>
            <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
            {"415-202-5464"}
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
      >
        {t("inviteToApplyPage.submitYourInfo.prepare.p5")}
      </Button>
    </div>
  )
}

const WhatToDo = ({ listing }: { listing: RailsSaleListing }) => {
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
          <Button variant="primary-outlined" href={"tbd"} newWindowTarget>
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
              link: `${getCurrentLanguage()}/listings/documents?listingId=${listing?.Id}`,
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
          <Button>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p4")}</Button>
          <Heading priority={3} size="lg">
            {t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p5")}
          </Heading>
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p6")}</p>
          <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p7")}</p>
        </li>
      </ol>
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
      <strong>{listing?.Name}</strong>
      <p>{listing && getListingAddressString(listing)}</p>
      <a href={`${getCurrentLanguage()}/listings/${listing?.Id}`}>
        {t("inviteToApplyPage.submitYourInfo.p1")}
      </a>
    </div>
  )
}

const SubmitYourInfoSidebarBlock = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <SidebarBlock title={t("contactAgent.contact")} priority={2}>
      <Heading priority={3} size="lg" className={styles.responseHeading}>
        {t("inviteToApplyPage.submitYourInfo.sidebar")}
      </Heading>
      <p>{listing?.Leasing_Agent_Name}</p>
      <p className="field-note">{t("inviteToApplyPage.leasingAgent")}</p>
      <a className={styles.responseIcon} href={`tel:+1${listing?.Leasing_Agent_Phone}`}>
        <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
        {listing?.Leasing_Agent_Phone}
      </a>
      <a className={styles.responseIcon} href={`mailto:${listing?.Leasing_Agent_Email}`}>
        <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
        {listing?.Leasing_Agent_Email}
      </a>
      <Heading size="sm" priority={3}>
        {t("contactAgent.officeHours.seeTheUnit")}
      </Heading>
      <p>{getTranslatedString(listing?.Office_Hours, "Office_Hours__c", listing?.translations)}</p>
    </SidebarBlock>
  )
}

const InviteToApplySubmitYourInfo = ({ listing, deadline }: InviteToApplySubmitYourInfoProps) => {
  const { getAssetPath } = React.useContext(ConfigContext)
  return (
    <Layout>
      <PageHeader
        title={t("inviteToApplyPage.submitYourInfo.title", { listingName: listing?.Name })}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      <div className={styles.submitYourInfo}>
        <div className={styles.submitYourInfoPage}>
          <main className={styles.submitYourInfoMain}>
            <SubmitYourInfoHeader listing={listing} />
            <DeadlineBanner deadline={deadline} />
            <PreparingYourApplication />
            <WhatToDo listing={listing} />
            <Mobile>
              <SubmitYourInfoSidebarBlock listing={listing} />
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
