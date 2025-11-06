import React from "react"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { t, PageHeader } from "@bloom-housing/ui-components"
import Layout from "../../layouts/Layout"
import styles from "./invite-to-apply.module.scss"
import { ConfigContext } from "../../lib/ConfigContext"
interface InviteToApplyDocumentsProps {
  listing: RailsSaleListing | null
}

const CheckWhatYouNeed = () => {
  return (
    <div>
      <h2>{t("inviteToApplyPage.documents.checkWhatYouNeed.title")}</h2>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p1")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p2")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p3")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p4")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p5")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p6")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p7")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p8")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p9")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p10")}</p>
      <p>{t("inviteToApplyPage.documents.checkWhatYouNeed.p11")}</p>
    </div>
  )
}

const TaxDocuments = () => {
  return (
    <div>
      <h2>{t("inviteToApplyPage.documents.taxDocuments.title")}</h2>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p1")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p2")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p3")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p4")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p5")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p6")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p7")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p8")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p9")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p10")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p11")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p12")}</p>
      <p>{t("inviteToApplyPage.documents.taxDocuments.p13")}</p>
    </div>
  )
}

const ProofOfIncome = () => {
  return (
    <div>
      <h2>{t("inviteToApplyPage.documents.proofOfIncome.title")}</h2>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p1")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p2")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p3")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p4")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p5")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p6")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p7")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p8")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p9")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p10")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p11")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p12")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p13")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p14")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p15")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p16")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p17")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p18")}</p>
      <p>{t("inviteToApplyPage.documents.proofOfIncome.p19")}</p>
    </div>
  )
}

const BankAndFinancials = () => {
  return (
    <div>
      <h2>{t("inviteToApplyPage.documents.bankAndFinancial.title")}</h2>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p1")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p2")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p3")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p4")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p5")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p6")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p7")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p8")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p9")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p10")}</p>
      <p>{t("inviteToApplyPage.documents.bankAndFinancial.p11")}</p>
    </div>
  )
}

const HousingAssistance = () => {
  return (
    <div>
      <h2>{t("inviteToApplyPage.documents.housingAssistance.title")}</h2>
      <p>{t("inviteToApplyPage.documents.housingAssistance.p1")}</p>
      <p>{t("inviteToApplyPage.documents.housingAssistance.p2")}</p>
      <p>{t("inviteToApplyPage.documents.housingAssistance.p3")}</p>
      <p>{t("inviteToApplyPage.documents.housingAssistance.p4")}</p>
      <p>{t("inviteToApplyPage.documents.housingAssistance.p5")}</p>
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
            <h2> Need help sidebar</h2>
          </aside>
        </div>
      </div>
    </Layout>
  )
}

export default InviteToApplyDocuments
