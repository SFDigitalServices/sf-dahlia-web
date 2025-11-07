import React from "react"
import {
  t,
  PageHeader,
  Icon,
  ContentAccordion,
  IconFillColors,
  SidebarBlock,
} from "@bloom-housing/ui-components"
import { Heading, Button, Message } from "@bloom-housing/ui-seeds"
import { faPrint, faEnvelope } from "@fortawesome/free-solid-svg-icons"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import Layout from "../../layouts/Layout"
import { renderInlineMarkup } from "../../util/languageUtil"
import { ConfigContext } from "../../lib/ConfigContext"
import { LeasingAgentInfo } from "./InviteToApplySubmitYourInfo"

import styles from "./invite-to-apply.module.scss"
interface InviteToApplyDocumentsProps {
  listing: RailsSaleListing | null
}

const CheckWhatYouNeed = () => {
  return (
    <div className={styles.submitYourInfoSection} id="checkWhatYouNeed">
      <Heading priority={2} size="2xl">
        {t("inviteToApplyPage.documents.checkWhatYouNeed.title")}
      </Heading>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p1")}</p>
      <ol>
        <li>
          {renderInlineMarkup(
            t("inviteToApplyPage.documents.checkWhatYouNeed.p2", { link: "#taxDocuments" })
          )}
        </li>
        <li>
          {renderInlineMarkup(
            t("inviteToApplyPage.documents.checkWhatYouNeed.p3", { link: "#proofOfIncome" })
          )}
        </li>
        <li>
          {renderInlineMarkup(
            t("inviteToApplyPage.documents.checkWhatYouNeed.p4", { link: "#bankAndFinancial" })
          )}
        </li>
        <li>
          {renderInlineMarkup(
            t("inviteToApplyPage.documents.checkWhatYouNeed.p5", { link: "#housingAssistance" })
          )}
        </li>
      </ol>
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.documents.checkWhatYouNeed.p6")}
      </Heading>
      <p>{renderInlineMarkup(t("inviteToApplyPage.documents.checkWhatYouNeed.p7"))}</p>
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.documents.checkWhatYouNeed.p8")}
      </Heading>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p9")}</p>
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.documents.checkWhatYouNeed.p10")}
      </Heading>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p11")}</p>
      <Button
        leadIcon={<Icon symbol={faPrint} size="medium" />}
        variant="primary-outlined"
        onClick={() => window.print()}
      >
        {t("inviteToApplyPage.submitYourInfo.prepare.p5")}
      </Button>
    </div>
  )
}

const TaxDocuments = () => {
  return (
    <div className={styles.submitYourInfoSection} id="taxDocuments">
      <Heading priority={2} size="2xl">
        {t("inviteToApplyPage.documents.taxDocuments.title")}
      </Heading>
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.documents.taxDocuments.p1")}
      </Heading>
      <p>{t("inviteToApplyPage.documents.provide")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.taxDocuments.p2"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.taxDocuments.p3"))}</li>
      </ul>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p4")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p5")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.taxDocuments.p6"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.taxDocuments.p7"))}</li>
      </ul>
      <ContentAccordion
        customBarContent={t("inviteToApplyPage.documents.taxDocuments.p8")}
        customExpandedContent={
          <div>{renderInlineMarkup(t("inviteToApplyPage.documents.taxDocuments.p9"))}</div>
        }
        accordionTheme={"gray"}
      />
      <ContentAccordion
        customBarContent={t("inviteToApplyPage.documents.taxDocuments.p10")}
        customExpandedContent={
          <div>{renderInlineMarkup(t("inviteToApplyPage.documents.taxDocuments.p11"))}</div>
        }
        accordionTheme={"gray"}
      />
      <ContentAccordion
        customBarContent={t("inviteToApplyPage.documents.taxDocuments.p12")}
        customExpandedContent={
          <div>{renderInlineMarkup(t("inviteToApplyPage.documents.taxDocuments.p13"))}</div>
        }
        accordionTheme={"gray"}
      />
    </div>
  )
}

const ProofOfIncome = () => {
  return (
    <div className={styles.submitYourInfoSection} id="proofOfIncome">
      <Heading priority={2} size="2xl">
        {t("inviteToApplyPage.documents.proofOfIncome.title")}
      </Heading>
      <Message fullwidth variant="primary">
        <p>{t("inviteToApplyPage.documents.proofOfIncome.p1")}</p>
        <p>{t("inviteToApplyPage.documents.proofOfIncome.p2")}</p>
      </Message>
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.documents.proofOfIncome.p3")}
      </Heading>
      <p>{t("inviteToApplyPage.documents.provide")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p4"))}</li>
        <li>{t("inviteToApplyPage.documents.proofOfIncome.p5")}</li>
      </ul>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p6")}</p>
      <p>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p7"))}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p8"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p9"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p10"))}</li>
      </ul>
      <ContentAccordion
        customBarContent={renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p11"))}
        customExpandedContent={<div>{t("inviteToApplyPage.documents.proofOfIncome.p12")}</div>}
        accordionTheme={"gray"}
      />
      <ContentAccordion
        customBarContent={renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p13"))}
        customExpandedContent={<div>{t("inviteToApplyPage.documents.proofOfIncome.p14")}</div>}
        accordionTheme={"gray"}
      />
      <Heading priority={3} size="lg">
        {t("inviteToApplyPage.documents.proofOfIncome.p15")}
      </Heading>
      <p>{t("inviteToApplyPage.documents.provide")}</p>
      <ul>
        <li>{t("inviteToApplyPage.documents.proofOfIncome.p16")}</li>
      </ul>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p17"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p18"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.proofOfIncome.p19"))}</li>
      </ul>
    </div>
  )
}

const BankAndFinancials = () => {
  return (
    <div className={styles.submitYourInfoSection} id="bankAndFinancial">
      <Heading priority={2} size="2xl">
        {t("inviteToApplyPage.documents.bankAndFinancial.title")}
      </Heading>
      <Message fullwidth variant="primary">
        {" "}
        <p>{t("inviteToApplyPage.documents.bankAndFinancial.p1")}</p>
        <p>{t("inviteToApplyPage.documents.bankAndFinancial.p2")}</p>
      </Message>
      <p>{t("inviteToApplyPage.documents.provide")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.bankAndFinancial.p3"))}</li>
      </ul>
      <ul>
        <li>{t("inviteToApplyPage.documents.bankAndFinancial.p4")}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.bankAndFinancial.p5"))}</li>
      </ul>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.bankAndFinancial.p6"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.bankAndFinancial.p7"))}</li>

        <p>{t("inviteToApplyPage.documents.bankAndFinancial.p8")}</p>
      </ul>
      <ul>
        <p>{t("inviteToApplyPage.documents.bankAndFinancial.p9")}</p>
        <p>{t("inviteToApplyPage.documents.bankAndFinancial.p10")}</p>
        <p>{t("inviteToApplyPage.documents.bankAndFinancial.p11")}</p>
      </ul>
    </div>
  )
}

const HousingAssistance = () => {
  return (
    <div className={styles.submitYourInfoSection} id="housingAssistance">
      <Heading priority={2} size="2xl">
        {t("inviteToApplyPage.documents.housingAssistance.title")}
      </Heading>
      <p>{t("inviteToApplyPage.documents.provide")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.housingAssistance.p1"))}</li>
      </ul>
      <p>{t("inviteToApplyPage.documents.housingAssistance.p2")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.housingAssistance.p3"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.housingAssistance.p4"))}</li>
        <li>{renderInlineMarkup(t("inviteToApplyPage.documents.housingAssistance.p5"))}</li>
      </ul>
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
    </div>
  )
}

const InviteToApplyDocuments = ({ listing }: InviteToApplyDocumentsProps) => {
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
            <CheckWhatYouNeed />
            <TaxDocuments />
            <ProofOfIncome />
            <BankAndFinancials />
            <HousingAssistance />
          </main>
          <aside className={styles.submitYourInfoSidebar}>
            <SidebarBlock title={t("contactAgent.contact")} priority={2}>
              <LeasingAgentInfo listing={listing} />
            </SidebarBlock>
          </aside>
        </div>
      </div>
    </Layout>
  )
}

export default InviteToApplyDocuments
