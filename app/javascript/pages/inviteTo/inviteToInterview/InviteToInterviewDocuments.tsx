import React from "react"
import {
  t,
  PageHeader,
  Icon,
  ContentAccordion,
  ExpandableContent,
  Order,
  IconFillColors,
  SidebarBlock,
} from "@bloom-housing/ui-components"
import { Heading, Button, Message } from "@bloom-housing/ui-seeds"
import { faPrint, faEnvelope } from "@fortawesome/free-solid-svg-icons"
import RailsSaleListing from "../../../api/types/rails/listings/RailsSaleListing"
import Layout from "../../../layouts/Layout"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { ConfigContext } from "../../../lib/ConfigContext"
import InviteToApplyLeasingAgentInfo from "../InviteToLeasingAgentInfo"

import styles from "../invite-to.module.scss"
import { HOME_SF_PHONE } from "../../../modules/constants"

interface InviteToInterviewDocumentsProps {
  listing: RailsSaleListing | null
}

const CheckWhatYouNeed = () => {
  return (
    <div className={styles.submitYourInfoSection} id="checkWhatYouNeed">
      <Heading priority={2} size="2xl">
        {t("inviteToInterviewPage.documents.checkWhatYouNeed.title")}
      </Heading>
      <p>{renderInlineMarkup(t("inviteToInterviewPage.documents.checkWhatYouNeed.p1"))}</p>
      <ol>
        <li>
          {renderInlineMarkup(
            t("inviteToInterviewPage.documents.checkWhatYouNeed.p2", {
              link: "#identityDocuments",
            })
          )}
        </li>
        <li>
          {renderInlineMarkup(
            t("inviteToInterviewPage.documents.checkWhatYouNeed.p3", {
              link: "#proofOfIncome",
            })
          )}
        </li>
        <li>
          {renderInlineMarkup(
            t("inviteToInterviewPage.documents.checkWhatYouNeed.p4", {
              link: "#bankAndFinancial",
            })
          )}
        </li>
        <li>
          {renderInlineMarkup(
            t("inviteToInterviewPage.documents.checkWhatYouNeed.p5", {
              link: "#rentalHistory",
            })
          )}
        </li>
      </ol>
      <p>{t("inviteToInterviewPage.documents.checkWhatYouNeed.p6")}</p>
      <ol>
        <li>
          {renderInlineMarkup(
            t("inviteToInterviewPage.documents.checkWhatYouNeed.p7", {
              link: "#childCustody",
            })
          )}
        </li>
        <li>
          {renderInlineMarkup(
            t("inviteToInterviewPage.documents.checkWhatYouNeed.p8", {
              link: "#housingAssistance",
            })
          )}
        </li>
      </ol>
      <p>{t("inviteToInterviewPage.documents.checkWhatYouNeed.p9")}</p>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.documents.checkWhatYouNeed.bringDocuments.title")}
      </Heading>
      <p>{t("inviteToInterviewPage.documents.checkWhatYouNeed.bringDocuments.p1")}</p>
      <p>{t("inviteToInterviewPage.documents.checkWhatYouNeed.bringDocuments.p2")}</p>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.documents.checkWhatYouNeed.whyWeAsk.title")}
      </Heading>
      <p>{t("inviteToInterviewPage.documents.checkWhatYouNeed.whyWeAsk.p1")}</p>
      <ul>
        <li>{t("inviteToInterviewPage.documents.checkWhatYouNeed.whyWeAsk.p2")}</li>
        <li>{t("inviteToInterviewPage.documents.checkWhatYouNeed.whyWeAsk.p3")}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.checkWhatYouNeed.whyWeAsk.p4")}</p>
      <p>{t("inviteToInterviewPage.documents.checkWhatYouNeed.whyWeAsk.p5")}</p>
      <Button
        leadIcon={<Icon symbol={faPrint} size="medium" />}
        variant="primary-outlined"
        onClick={() => window.print()}
        className={styles.actionButton}
      >
        {t("inviteToInterviewPage.documents.printThisPage")}
      </Button>
    </div>
  )
}

const IdentityDocuments = () => {
  return (
    <div className={styles.submitYourInfoSection} id="identityDocuments">
      <Heading priority={2} size="2xl">
        {"1. " + t("inviteToInterviewPage.documents.identity.title")}
      </Heading>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.documents.identity.adults.title")}
      </Heading>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.identity.adults.p1"))}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.identity.adults.p2")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.identity.adults.p3"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.identity.adults.p4"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.identity.adults.p5"))}</li>
      </ul>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.documents.identity.children.title")}
      </Heading>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.identity.children.p1"))}</li>
      </ul>
      <Heading priority={3} size="lg">
        {t("inviteToInterviewPage.documents.identity.everyone.title")}
      </Heading>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.identity.everyone.p1"))}</li>
      </ul>
      <div className={styles.infoSubSection}>
        <ExpandableContent
          strings={{
            readMore: t("inviteToInterviewPage.documents.identity.everyone.whyWeAsk"),
            readLess: t("inviteToInterviewPage.documents.identity.everyone.whyWeAsk"),
          }}
          order={Order.below}
        >
          <div className={styles.accordionContent}>
            {renderInlineMarkup(
              t("inviteToInterviewPage.documents.identity.everyone.whyWeAskContent", {
                link: "https://www.sf.gov/information--affordable-housing-protections-people-criminal-history",
              })
            )}
          </div>
        </ExpandableContent>
      </div>
    </div>
  )
}

const ProofOfIncome = () => {
  return (
    <div className={styles.submitYourInfoSection} id="proofOfIncome">
      <Heading priority={2} size="2xl">
        {"2. " + t("inviteToInterviewPage.documents.proofOfIncome.title")}
      </Heading>
      <Message fullwidth variant="primary" className={styles.messageBanner}>
        <strong>{t("inviteToInterviewPage.documents.proofOfIncome.messageBold")}</strong>
        <p>{t("inviteToInterviewPage.documents.proofOfIncome.messageBody")}</p>
      </Message>
      <p>{t("inviteToInterviewPage.documents.provide")}</p>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.p1"))}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.proofOfIncome.p2")}</p>
      <p>{t("inviteToInterviewPage.documents.proofOfIncome.p3")}</p>
      <p>{t("inviteToInterviewPage.documents.proofOfIncome.p4")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.p5"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.p6"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.p7"))}</li>
      </ul>
      <div className={styles.infoSubSection}>
        <ContentAccordion
          customBarContent={
            <div className={styles.accordionBar}>
              {t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.title")}
            </div>
          }
          customExpandedContent={
            <div className={styles.accordionContent}>
              <p>{t("inviteToInterviewPage.documents.provide")}</p>
              <ul className={styles.iconList}>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p1")
                  )}
                </li>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p2")
                  )}
                </li>
              </ul>
              <ul className={styles.iconList}>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p3")
                  )}
                </li>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p4")
                  )}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p5")}</p>
              <ul>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p6")
                  )}
                </li>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p7")
                  )}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p8")}</p>
              <ul>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p9")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p10")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p11")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.selfEmployed.p12")}</li>
              </ul>
            </div>
          }
          accordionTheme={"gray"}
        />
        <ContentAccordion
          customBarContent={
            <div className={styles.accordionBar}>
              {t("inviteToInterviewPage.documents.proofOfIncome.government.title")}
            </div>
          }
          customExpandedContent={
            <div className={styles.accordionContent}>
              <p>{t("inviteToInterviewPage.documents.provide")}</p>
              <ul className={styles.iconList}>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.government.p1")
                  )}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.government.p2")}</p>
              <ul>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.government.p3")
                  )}
                </li>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.government.p4")
                  )}
                </li>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.government.p5")
                  )}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.government.p6")}</p>
              <ul>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.government.p7")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.government.p8")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.government.p9")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.government.p10")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.government.p11")}</li>
              </ul>
            </div>
          }
          accordionTheme={"gray"}
        />
        <ContentAccordion
          customBarContent={
            <div className={styles.accordionBar}>
              {t("inviteToInterviewPage.documents.proofOfIncome.retirement.title")}
            </div>
          }
          customExpandedContent={
            <div className={styles.accordionContent}>
              <p>{t("inviteToInterviewPage.documents.provide")}</p>
              <ul className={styles.iconList}>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.retirement.p1")
                  )}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.retirement.p2")}</p>
              <ul>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.retirement.p3")
                  )}
                </li>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.retirement.p4")
                  )}
                </li>
                <li>
                  {renderInlineMarkup(
                    t("inviteToInterviewPage.documents.proofOfIncome.retirement.p5")
                  )}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.retirement.p6")}</p>
              <ul>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.retirement.p7")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.retirement.p8")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.retirement.p9")}</li>
              </ul>
            </div>
          }
          accordionTheme={"gray"}
        />
        <ContentAccordion
          customBarContent={
            <div className={styles.accordionBar}>
              {t("inviteToInterviewPage.documents.proofOfIncome.other.title")}
            </div>
          }
          customExpandedContent={
            <div className={styles.accordionContent}>
              <p>{t("inviteToInterviewPage.documents.provide")}</p>
              <ul className={styles.iconList}>
                <li>
                  {renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.other.p1"))}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.other.p2")}</p>
              <ul>
                <li>
                  {renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.other.p3"))}
                </li>
                <li>
                  {renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.other.p4"))}
                </li>
                <li>
                  {renderInlineMarkup(t("inviteToInterviewPage.documents.proofOfIncome.other.p5"))}
                </li>
              </ul>
              <p>{t("inviteToInterviewPage.documents.proofOfIncome.other.p6")}</p>
              <ul>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.other.p7")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.other.p8")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.other.p9")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.other.p10")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.other.p11")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.other.p12")}</li>
                <li>{t("inviteToInterviewPage.documents.proofOfIncome.other.p13")}</li>
              </ul>
              <Message fullwidth variant="primary" className={styles.messageBanner}>
                {t("inviteToInterviewPage.documents.proofOfIncome.other.messageBody")}
              </Message>
            </div>
          }
          accordionTheme={"gray"}
        />
      </div>
    </div>
  )
}

const BankAndFinancials = () => {
  return (
    <div className={styles.submitYourInfoSection} id="bankAndFinancial">
      <Heading priority={2} size="2xl">
        {"3. " + t("inviteToInterviewPage.documents.bankAndFinancial.title")}
      </Heading>
      <Message fullwidth variant="primary" className={styles.messageBanner}>
        <strong>{t("inviteToInterviewPage.documents.bankAndFinancial.messageBold")}</strong>
        <p>{t("inviteToInterviewPage.documents.bankAndFinancial.messageBody")}</p>
      </Message>
      <p>{t("inviteToInterviewPage.documents.provide")}</p>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.bankAndFinancial.p1"))}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.bankAndFinancial.p2")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.bankAndFinancial.p3"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.bankAndFinancial.p4"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.bankAndFinancial.p5"))}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.bankAndFinancial.p6")}</p>
      <ul>
        <li>{t("inviteToInterviewPage.documents.bankAndFinancial.p7")}</li>
        <li>{t("inviteToInterviewPage.documents.bankAndFinancial.p8")}</li>
        <li>{t("inviteToInterviewPage.documents.bankAndFinancial.p9")}</li>
        <li>{t("inviteToInterviewPage.documents.bankAndFinancial.p10")}</li>
        <li>{t("inviteToInterviewPage.documents.bankAndFinancial.p11")}</li>
      </ul>
    </div>
  )
}

const RentalHistory = () => {
  return (
    <div className={styles.submitYourInfoSection} id="rentalHistory">
      <Heading priority={2} size="2xl">
        {"4. " + t("inviteToInterviewPage.documents.rentalHistory.title")}
      </Heading>
      <p>{renderInlineMarkup(t("inviteToInterviewPage.documents.rentalHistory.p1"))}</p>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.rentalHistory.p2"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.rentalHistory.p3"))}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.rentalHistory.p4")}</p>
    </div>
  )
}

const ChildCustody = () => {
  return (
    <div className={styles.submitYourInfoSection} id="childCustody">
      <Heading priority={2} size="2xl">
        {"5. " + t("inviteToInterviewPage.documents.childCustody.title")}
      </Heading>
      <p>{t("inviteToInterviewPage.documents.provide")}</p>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.childCustody.p1"))}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.childCustody.p2")}</p>
      <ul>
        <li>{t("inviteToInterviewPage.documents.childCustody.p3")}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.childCustody.p4")}</p>
      <ul>
        <li>{t("inviteToInterviewPage.documents.childCustody.p5")}</li>
        <li>{t("inviteToInterviewPage.documents.childCustody.p6")}</li>
        <li>{t("inviteToInterviewPage.documents.childCustody.p7")}</li>
      </ul>
    </div>
  )
}

const HousingAssistance = () => {
  return (
    <div className={styles.submitYourInfoSection} id="housingAssistance">
      <Heading priority={2} size="2xl">
        {"6. " + t("inviteToInterviewPage.documents.housingAssistance.title")}
      </Heading>
      <p>{t("inviteToInterviewPage.documents.provide")}</p>
      <ul className={styles.iconList}>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.housingAssistance.p1"))}</li>
      </ul>
      <p>{t("inviteToInterviewPage.documents.housingAssistance.p2")}</p>
      <ul>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.housingAssistance.p3"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.housingAssistance.p4"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.housingAssistance.p5"))}</li>
        <li>{renderInlineMarkup(t("inviteToInterviewPage.documents.housingAssistance.p6"))}</li>
      </ul>
    </div>
  )
}

const InviteToInterviewDocumentsSidebar = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <>
      <SidebarBlock title={t("inviteToInterviewPage.documents.sidebar.needHelp")} priority={2}>
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
      </SidebarBlock>
      <SidebarBlock title={t("inviteToInterviewPage.documents.sidebar.contact")} priority={2}>
        <p>
          <strong>{t("inviteToInterviewPage.documents.sidebar.contactSubtitle")}</strong>
        </p>
        <p>{t("inviteToInterviewPage.documents.sidebar.contactLabel")}</p>
        <InviteToApplyLeasingAgentInfo listing={listing} />
        <p>
          <strong>{t("inviteToInterviewPage.documents.sidebar.officeHours")}</strong>
        </p>
        <p>{listing?.Office_Hours}</p>
      </SidebarBlock>
    </>
  )
}

const InviteToInterviewDocuments = ({ listing }: InviteToInterviewDocumentsProps) => {
  const { getAssetPath } = React.useContext(ConfigContext)

  return (
    <Layout>
      <PageHeader
        title={t("inviteToInterviewPage.documents.title", {
          listingName: listing?.Building_Name_for_Process,
        })}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      <div className={styles.submitYourInfo}>
        <div className={styles.submitYourInfoPage}>
          <main className={styles.submitYourInfoMain}>
            <CheckWhatYouNeed />
            <IdentityDocuments />
            <ProofOfIncome />
            <BankAndFinancials />
            <RentalHistory />
            <ChildCustody />
            <HousingAssistance />
          </main>
          <aside className={styles.submitYourInfoSidebar}>
            <InviteToInterviewDocumentsSidebar listing={listing} />
          </aside>
        </div>
      </div>
    </Layout>
  )
}

export default InviteToInterviewDocuments
