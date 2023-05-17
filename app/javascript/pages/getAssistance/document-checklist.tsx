import { ContentAccordion, t } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { renderInlineMarkup } from "../../util/languageUtil"
const DocumentChecklist = () => {
  const preferences = [
    {
      title: t("listings.lotteryPreference.Neighborhood Resident Housing Preference (NRHP).title"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.nrhpDoc1"), "<ul><li>")}</p>
          <p>{t("documentChecklist.nrhpDoc2")}</p>
          <ul className="list-disc ml-7">
            <li>{t("label.proof.telephoneBill")}</li>
            <li>{t("label.proof.cableBill")}</li>
            <li>{t("label.proof.electricBill")}</li>
            <li>{t("label.proof.gasBill")}</li>
            <li>{t("label.proof.waterBill")}</li>
            <li>{t("label.proof.paystubHome")}</li>
            <li>{t("label.proof.publicBenefits")}</li>
            <li>{t("label.proof.schoolRecord")}</li>
            <li>{t("label.proof.homelessness")}</li>
          </ul>
        </div>
      ),
    },
    {
      title: t("e2cLiveWorkPreference.liveSfPreference.title"),
      expanded: (
        <div className="space-y-2.5">
          <p>{t("documentChecklist.liveSfDoc1")}</p>
          <p>{t("documentChecklist.liveSfDoc2")}</p>
          <ul className="list-disc ml-7">
            <li>{t("label.proof.telephoneBill")}</li>
            <li>{t("label.proof.cableBill")}</li>
            <li>{t("label.proof.electricBill")}</li>
            <li>{t("label.proof.gasBill")}</li>
            <li>{t("label.proof.waterBill")}</li>
            <li>{t("label.proof.paystubHome")}</li>
            <li>{t("label.proof.publicBenefits")}</li>
            <li>{t("label.proof.schoolRecord")}</li>
            <li>{t("label.proof.homelessness")}</li>
          </ul>
        </div>
      ),
    },
    {
      title: t("e2cLiveWorkPreference.workSfPreference.title"),
      expanded: (
        <div className="space-y-2.5">
          <p>{t("documentChecklist.workSfDoc1")}</p>
          <p>{t("documentChecklist.workSfDoc2")}</p>
          <ul className="list-disc ml-7">
            <li>{t("label.proof.paystubEmployer")}</li>
            <li>{t("label.proof.letterFromEmployer")}</li>
          </ul>
        </div>
      ),
    },
    {
      title: t("e7PreferencesPrograms.certOfPreference"),
      expanded: (
        <div className="space-y-2.5">
          <p>{t("documentChecklist.copDoc1")}</p>
          <p>{renderInlineMarkup(t("documentChecklist.copDoc2"))}</p>
        </div>
      ),
    },
    {
      title: t("e7PreferencesPrograms.displaced"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.dthpDoc1"))}</p>
          <p>{renderInlineMarkup(t("documentChecklist.dthpDoc2"), "<ul><li>")}</p>
          <p>{renderInlineMarkup(t("documentChecklist.dthpDoc3"))}</p>
        </div>
      ),
    },
    {
      title: t("documentChecklist.assistedHousingTitle"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.assistedHousingDoc1"))}</p>
          <p>{t("documentChecklist.assistedHousingDoc2")}</p>
        </div>
      ),
    },
    {
      title: t("documentChecklist.rentBurdenTitle"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.rentBurdenDoc1"))}</p>
          <p>{renderInlineMarkup(t("documentChecklist.rentBurdenDoc2"), "<ol><li>")}</p>
          <ul className="list-disc ml-7">
            <li>{t("label.proof.moneyOrder")}</li>
            <li>{t("label.proof.cancelledCheck")}</li>
            <li>{t("label.proof.debitFromBank")}</li>
            <li>{t("label.proof.onlinePayment")}</li>
          </ul>
        </div>
      ),
    },
    {
      title: t("documentChecklist.hopeSfTitle"),
      expanded: (
        <div className="space-y-2.5">
          <p>{t("documentChecklist.hopeSfDoc1")}</p>
          <p>{t("documentChecklist.hopeSfDoc2")}</p>
          <ul className="list-disc ml-7">
            <li>{t("label.proof.sfhaResidencyLetter")}</li>
            <li>{t("label.proof.sfhaLease")}</li>
            <li>{t("label.proof.sfCityId")}</li>
            <li>{t("label.proof.telephoneBill")}</li>
            <li>{t("label.proof.cableBill")}</li>
            <li>{t("label.proof.paystubHome")}</li>
            <li>{t("label.proof.publicBenefits")}</li>
            <li>{t("label.proof.schoolRecord")}</li>
          </ul>
        </div>
      ),
    },
  ].map((pref) => (
    <ContentAccordion
      customBarContent={pref.title}
      customExpandedContent={<div className="p-5 border-2 border-gray-400">{pref.expanded}</div>}
      accordionTheme={"gray"}
    />
  ))
  return (
    <AssistanceLayout
      title={t("assistance.title.documentChecklist")}
      subtitle={t("assistance.subtitle.documentChecklist")}
    >
      {
        <div className="flex flex-col w-full space-y-4 py-12 pr-12">
          <h3>{t("documentChecklist.preferenceHeader")}</h3>
          <p>{t("documentChecklist.p1")}</p>
          <p>{t("documentChecklist.p2")}</p>
          <p>{renderInlineMarkup(t("documentChecklist.p3"))}</p>
          {preferences}
          <div>
            <hr className="mt-9 mb-5" />
          </div>
          <h3>{t("documentChecklist.homebuyerHeader")}</h3>

          <p>{t("documentChecklist.homebuyerDesc")}</p>
          <ol className="list-decimal ml-7">
            <li>{t("documentChecklist.homebuyerEducationDesc")}</li>
            <li>{renderInlineMarkup(t("documentChecklist.homebuyerLoanDesc"))}</li>
          </ol>
          <p>{t("label.applicationUploadBothDocuments")}</p>
        </div>
      }
    </AssistanceLayout>
  )
}

export default withAppSetup(DocumentChecklist)
