import React from "react"
import { Heading, Message } from "@bloom-housing/ui-seeds"
import { SidebarBlock, Icon, PageHeader, Desktop, t } from "@bloom-housing/ui-components"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getListingAddressString, isDeadlinePassed } from "../../util/listingUtil"
import {
  getTranslatedString,
  renderInlineMarkup,
  getCurrentLanguage,
  localizedFormat,
} from "../../util/languageUtil"
import styles from "./invite-to.module.scss"
import InviteToLeasingAgentInfo from "./InviteToLeasingAgentInfo"
import Layout from "../../layouts/Layout"

const InviteToHeader = ({
  listing,
  headerText,
}: {
  listing: RailsSaleListing
  headerText: string
}) => {
  return (
    <div className={styles.submitYourInfoSection}>
      <img
        src={listing?.Listing_Images?.[0]?.Image_URL}
        alt={listing?.Listing_Images?.[0]?.Image_Description}
      />
      <strong>{listing?.Building_Name_for_Process}</strong>
      <p>{listing && getListingAddressString(listing, false)}</p>
      <a href={`/${getCurrentLanguage()}/listings/${listing?.Id}`}>{t(headerText)}</a>
    </div>
  )
}

const DeadlineBanner = ({
  deadline,
  listing,
  type,
}: {
  deadline: string
  listing: RailsSaleListing
  type: string
}) => {
  if (type === "I2A") {
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

  return (
    <Message
      variant={isDeadlinePassed(deadline) ? "alert" : "warn"}
      fullwidth
      customIcon={<Icon symbol="clock" size="medium" />}
      testId={isDeadlinePassed(deadline) ? "deadline-passed-banner" : "deadline-not-passed-banner"}
    >
      {isDeadlinePassed(deadline) ? (
        renderInlineMarkup(
          t("inviteToInterviewPage.submitYourInfo.deadlineInfo", {
            day: localizedFormat(deadline, "ll"),
            listingName: listing?.Building_Name_for_Process,
          })
        )
      ) : (
        <>
          <strong>{t("inviteToInterviewPage.submitYourInfo.scheduleByDeadline")}</strong>
          {t("inviteToInterviewPage.submitYourInfo.deadline", {
            day: localizedFormat(deadline, "ll"),
          })}
        </>
      )}
    </Message>
  )
}

const InviteToSidebarBlock = ({
  listing,
  sidebarText,
}: {
  listing: RailsSaleListing
  sidebarText: string
}) => {
  return (
    <SidebarBlock title={t("contactAgent.contact")} priority={2}>
      <Heading size="lg" priority={3}>
        {t(sidebarText)}
      </Heading>
      <InviteToLeasingAgentInfo listing={listing} />
      <Heading size="sm" priority={3}>
        {t("contactAgent.officeHours.seeTheUnit")}
      </Heading>
      <p>{getTranslatedString(listing?.Office_Hours, "Office_Hours__c", listing?.translations)}</p>
    </SidebarBlock>
  )
}

interface InviteToLayoutProps {
  listing: RailsSaleListing
  type: "I2I" | "I2A"
  title?: string
  subtitle?: string
  children: React.ReactNode
  getAssetPath: (path: string) => string
  sidebarText: string
  headerText: string
  deadline: string
}

const InviteToLayout = ({
  listing,
  type,
  title,
  subtitle,
  children,
  getAssetPath,
  sidebarText,
  headerText,
  deadline,
}: InviteToLayoutProps) => {
  return (
    <Layout>
      <PageHeader
        title={title || listing?.Building_Name_for_Process || listing?.Name}
        subtitle={subtitle}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      <div className={styles.submitYourInfo}>
        <div className={styles.submitYourInfoPage}>
          <main className={styles.submitYourInfoMain}>
            <InviteToHeader listing={listing} headerText={headerText} />
            <DeadlineBanner deadline={deadline} listing={listing} type={type} />
            {children}
          </main>
          <Desktop>
            <aside className={styles.submitYourInfoSidebar}>
              <InviteToSidebarBlock listing={listing} sidebarText={sidebarText} />
            </aside>
          </Desktop>
        </div>
      </div>
    </Layout>
  )
}

export default InviteToLayout
